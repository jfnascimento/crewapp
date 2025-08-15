import { mongoService, VectorDocument } from './mongodb';
import { aiServiceManager } from './ai-services';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ProcessingResult {
  success: boolean;
  documentsCreated: number;
  vectorIds: string[];
  error?: string;
}

export interface ChunkingOptions {
  chunkSize: number;
  overlap: number;
  preserveParagraphs: boolean;
}

export interface DocumentMetadata {
  projectId?: string;
  agentId?: string;
  sourceFile: string;
  fileType: string;
  tags?: string[];
}

class KnowledgeProcessor {
  private defaultChunkingOptions: ChunkingOptions = {
    chunkSize: 1000,
    overlap: 200,
    preserveParagraphs: true
  };

  constructor() {
    this.ensureUploadsDirectory();
  }

  private async ensureUploadsDirectory(): Promise<void> {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }
  }

  async processUploadedFile(
    filePath: string,
    metadata: DocumentMetadata,
    options?: Partial<ChunkingOptions>
  ): Promise<ProcessingResult> {
    try {
      await mongoService.connect();

      // Extract text from file
      const content = await this.extractText(filePath, metadata.fileType);
      
      // Chunk the content
      const chunkOptions = { ...this.defaultChunkingOptions, ...options };
      const chunks = this.chunkText(content, chunkOptions);

      // Generate embeddings for each chunk
      const vectorDocuments = await this.generateEmbeddings(chunks, metadata);

      // Store in MongoDB
      const vectorIds = await mongoService.insertManyVectorDocuments(vectorDocuments);

      return {
        success: true,
        documentsCreated: vectorDocuments.length,
        vectorIds,
      };
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      return {
        success: false,
        documentsCreated: 0,
        vectorIds: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async extractText(filePath: string, fileType: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');

    switch (fileType.toLowerCase()) {
      case 'txt':
      case 'md':
      case 'markdown':
        return content;
      
      case 'json':
        try {
          const jsonData = JSON.parse(content);
          return this.flattenJsonToText(jsonData);
        } catch {
          return content; // Fallback to raw content
        }
      
      case 'csv':
        return this.processCsvContent(content);
      
      default:
        // For unsupported formats, return raw content
        // In production, you'd integrate PDF/DOCX parsers here
        return content;
    }
  }

  private flattenJsonToText(obj: any, prefix = ''): string {
    let text = '';
    
    for (const [key, value] of Object.entries(obj)) {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        text += this.flattenJsonToText(value, currentKey);
      } else if (Array.isArray(value)) {
        text += `${currentKey}: ${value.join(', ')}\n`;
      } else {
        text += `${currentKey}: ${value}\n`;
      }
    }
    
    return text;
  }

  private processCsvContent(content: string): string {
    const lines = content.split('\n');
    if (lines.length === 0) return content;

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    let processedText = `Headers: ${headers.join(', ')}\n\n`;

    for (let i = 1; i < Math.min(lines.length, 100); i++) { // Limit to first 100 rows
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const rowData = headers.map((header, idx) => `${header}: ${values[idx] || 'N/A'}`).join(', ');
      processedText += `Row ${i}: ${rowData}\n`;
    }

    return processedText;
  }

  private chunkText(text: string, options: ChunkingOptions): string[] {
    if (options.preserveParagraphs) {
      return this.chunkByParagraphs(text, options);
    }
    return this.chunkByCharacters(text, options);
  }

  private chunkByParagraphs(text: string, options: ChunkingOptions): string[] {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length <= options.chunkSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        
        if (paragraph.length > options.chunkSize) {
          // Split large paragraphs
          const subChunks = this.chunkByCharacters(paragraph, options);
          chunks.push(...subChunks);
          currentChunk = '';
        } else {
          currentChunk = paragraph;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  private chunkByCharacters(text: string, options: ChunkingOptions): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + options.chunkSize;
      
      if (end > text.length) {
        end = text.length;
      }

      // Try to break at word boundary
      if (end < text.length) {
        let lastSpace = text.lastIndexOf(' ', end);
        if (lastSpace > start + options.chunkSize * 0.8) {
          end = lastSpace;
        }
      }

      chunks.push(text.slice(start, end).trim());
      start = end - options.overlap;
    }

    return chunks.filter(chunk => chunk.length > 0);
  }

  private async generateEmbeddings(
    chunks: string[], 
    metadata: DocumentMetadata
  ): Promise<Omit<VectorDocument, '_id'>[]> {
    const vectorDocuments: Omit<VectorDocument, '_id'>[] = [];

    // Generate embeddings using a simple method
    // In production, you'd use a proper embedding model
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Simple embedding generation (hash-based)
      // This is a placeholder - in production use proper embeddings
      const embedding = await this.generateSimpleEmbedding(chunk);
      
      vectorDocuments.push({
        content: chunk,
        embedding,
        metadata: {
          ...metadata,
          chunkIndex: i,
          totalChunks: chunks.length,
          createdAt: new Date(),
        }
      });
    }

    return vectorDocuments;
  }

  private async generateSimpleEmbedding(text: string): Promise<number[]> {
    // Simple text-to-vector conversion for demonstration
    // In production, use proper embedding models like OpenAI embeddings or sentence-transformers
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCounts = new Map<string, number>();
    
    // Count word frequencies
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });

    // Create a simple 384-dimensional embedding
    const embedding = new Array(384).fill(0);
    
    // Use word hash positions to set embedding values
    Array.from(wordCounts.entries()).forEach(([word, count]) => {
      const hash = this.simpleHash(word);
      for (let i = 0; i < 5; i++) {
        const pos = (hash + i) % 384;
        embedding[pos] += count * 0.1;
      }
    });

    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  async searchKnowledge(
    query: string,
    options: {
      projectId?: string;
      agentId?: string;
      limit?: number;
      threshold?: number;
    } = {}
  ): Promise<Array<{
    content: string;
    similarity: number;
    metadata: any;
  }>> {
    try {
      await mongoService.connect();

      // Generate embedding for query
      const queryEmbedding = await this.generateSimpleEmbedding(query);

      // Search for similar documents
      const results = await mongoService.searchSimilarDocuments(queryEmbedding, options);

      return results.map(result => ({
        content: result.content,
        similarity: result.similarity || 0,
        metadata: result.metadata
      }));
    } catch (error) {
      console.error('Error searching knowledge:', error);
      return [];
    }
  }

  async getKnowledgeStats(): Promise<{
    totalDocuments: number;
    documentsByProject: { [projectId: string]: number };
    documentsByAgent: { [agentId: string]: number };
  }> {
    try {
      await mongoService.connect();
      return await mongoService.getStats();
    } catch (error) {
      console.error('Error getting knowledge stats:', error);
      return {
        totalDocuments: 0,
        documentsByProject: {},
        documentsByAgent: {}
      };
    }
  }

  async deleteProjectKnowledge(projectId: string): Promise<number> {
    try {
      await mongoService.connect();
      return await mongoService.deleteDocumentsByProject(projectId);
    } catch (error) {
      console.error('Error deleting project knowledge:', error);
      return 0;
    }
  }

  async deleteAgentKnowledge(agentId: string): Promise<number> {
    try {
      await mongoService.connect();
      return await mongoService.deleteDocumentsByAgent(agentId);
    } catch (error) {
      console.error('Error deleting agent knowledge:', error);
      return 0;
    }
  }
}

export const knowledgeProcessor = new KnowledgeProcessor();