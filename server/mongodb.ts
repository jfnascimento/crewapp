import { MongoClient, Db, Collection } from 'mongodb';

export interface VectorDocument {
  _id?: string;
  content: string;
  embedding: number[];
  metadata: {
    projectId?: string;
    agentId?: string;
    sourceFile?: string;
    chunkIndex?: number;
    totalChunks?: number;
    createdAt: Date;
    tags?: string[];
  };
}

export interface KnowledgeChunk {
  id: string;
  content: string;
  embedding: number[];
  similarity?: number;
  metadata: any;
}

class MongoDBService {
  private client: MongoClient;
  private db: Db | null = null;
  private isConnected = false;

  constructor() {
    const mongoUri = 'mongodb+srv://mongo:lK3BrlkVyrmlZoFS@cluster0.xdrosbt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    this.client = new MongoClient(mongoUri);
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await this.client.connect();
      this.db = this.client.db('crewai_studio');
      this.isConnected = true;
      console.log('Connected to MongoDB Atlas');

      // Create indexes for better performance
      await this.setupIndexes();
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  private async setupIndexes(): Promise<void> {
    if (!this.db) return;

    const vectorCollection = this.db.collection('vectors');
    
    // Create indexes for vector search and metadata filtering
    await vectorCollection.createIndex({ 'metadata.projectId': 1 });
    await vectorCollection.createIndex({ 'metadata.agentId': 1 });
    await vectorCollection.createIndex({ 'metadata.createdAt': -1 });
    await vectorCollection.createIndex({ 'metadata.tags': 1 });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    }
  }

  getVectorCollection(): Collection<VectorDocument> {
    if (!this.db) throw new Error('MongoDB not connected');
    return this.db.collection('vectors');
  }

  async insertVectorDocument(document: Omit<VectorDocument, '_id'>): Promise<string> {
    const collection = this.getVectorCollection();
    const result = await collection.insertOne(document);
    return result.insertedId.toString();
  }

  async insertManyVectorDocuments(documents: Omit<VectorDocument, '_id'>[]): Promise<string[]> {
    if (documents.length === 0) return [];
    
    const collection = this.getVectorCollection();
    const result = await collection.insertMany(documents);
    return Object.values(result.insertedIds).map(id => id.toString());
  }

  async searchByMetadata(query: {
    projectId?: string;
    agentId?: string;
    tags?: string[];
    limit?: number;
  }): Promise<VectorDocument[]> {
    const collection = this.getVectorCollection();
    
    const filter: any = {};
    if (query.projectId) filter['metadata.projectId'] = query.projectId;
    if (query.agentId) filter['metadata.agentId'] = query.agentId;
    if (query.tags && query.tags.length > 0) {
      filter['metadata.tags'] = { $in: query.tags };
    }

    const documents = await collection
      .find(filter)
      .sort({ 'metadata.createdAt': -1 })
      .limit(query.limit || 10)
      .toArray();

    return documents;
  }

  // Simplified vector similarity search (would be better with a proper vector database like Qdrant)
  async searchSimilarDocuments(
    queryEmbedding: number[],
    options: {
      projectId?: string;
      agentId?: string;
      limit?: number;
      threshold?: number;
    } = {}
  ): Promise<KnowledgeChunk[]> {
    const collection = this.getVectorCollection();
    
    const filter: any = {};
    if (options.projectId) filter['metadata.projectId'] = options.projectId;
    if (options.agentId) filter['metadata.agentId'] = options.agentId;

    // Get documents and compute cosine similarity in memory
    // Note: This is not optimal for large datasets, a proper vector database would be better
    const documents = await collection
      .find(filter)
      .limit(options.limit || 50)
      .toArray();

    const similarities = documents.map(doc => {
      const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
      return {
        id: doc._id!.toString(),
        content: doc.content,
        embedding: doc.embedding,
        similarity,
        metadata: doc.metadata
      };
    });

    // Filter by threshold and sort by similarity
    const threshold = options.threshold || 0.7;
    return similarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, options.limit || 10);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
  }

  async deleteDocumentsByProject(projectId: string): Promise<number> {
    const collection = this.getVectorCollection();
    const result = await collection.deleteMany({ 'metadata.projectId': projectId });
    return result.deletedCount;
  }

  async deleteDocumentsByAgent(agentId: string): Promise<number> {
    const collection = this.getVectorCollection();
    const result = await collection.deleteMany({ 'metadata.agentId': agentId });
    return result.deletedCount;
  }

  async getStats(): Promise<{
    totalDocuments: number;
    documentsByProject: { [projectId: string]: number };
    documentsByAgent: { [agentId: string]: number };
  }> {
    const collection = this.getVectorCollection();

    const [totalCount, projectStats, agentStats] = await Promise.all([
      collection.countDocuments(),
      collection.aggregate([
        { $group: { _id: '$metadata.projectId', count: { $sum: 1 } } }
      ]).toArray(),
      collection.aggregate([
        { $group: { _id: '$metadata.agentId', count: { $sum: 1 } } }
      ]).toArray()
    ]);

    const documentsByProject: { [key: string]: number } = {};
    const documentsByAgent: { [key: string]: number } = {};

    projectStats.forEach(stat => {
      if (stat._id) documentsByProject[stat._id] = stat.count;
    });

    agentStats.forEach(stat => {
      if (stat._id) documentsByAgent[stat._id] = stat.count;
    });

    return {
      totalDocuments: totalCount,
      documentsByProject,
      documentsByAgent
    };
  }
}

export const mongoService = new MongoDBService();