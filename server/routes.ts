import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as path from "path";
import { storage } from "./storage";
import { aiServiceManager } from "./ai-services";
import { crewAIService } from "./crewai-service";
import { knowledgeProcessor } from "./knowledge-processor";
import {
  insertProjectSchema,
  insertAgentSchema,
  insertTaskSchema,
  insertCrewSchema,
  insertExecutionSchema,
  insertKnowledgeItemSchema,
  insertLlmConfigurationSchema,
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow text files, documents, and common formats
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/csv',
      'text/html',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(txt|md|json|csv|html|pdf|doc|docx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard endpoints
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Project endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validated = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validated);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const validated = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, validated);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Agent endpoints
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const validated = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(validated);
      res.status(201).json(agent);
    } catch (error) {
      console.error("Error creating agent:", error);
      res.status(400).json({ message: "Invalid agent data" });
    }
  });

  app.put("/api/agents/:id", async (req, res) => {
    try {
      const validated = insertAgentSchema.partial().parse(req.body);
      const agent = await storage.updateAgent(req.params.id, validated);
      res.json(agent);
    } catch (error) {
      console.error("Error updating agent:", error);
      res.status(400).json({ message: "Invalid agent data" });
    }
  });

  app.delete("/api/agents/:id", async (req, res) => {
    try {
      await storage.deleteAgent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });

  // Task endpoints
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validated = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validated);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const validated = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, validated);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Crew endpoints
  app.get("/api/crews", async (req, res) => {
    try {
      const crews = await storage.getCrews();
      res.json(crews);
    } catch (error) {
      console.error("Error fetching crews:", error);
      res.status(500).json({ message: "Failed to fetch crews" });
    }
  });

  app.get("/api/crews/:id", async (req, res) => {
    try {
      const crew = await storage.getCrew(req.params.id);
      if (!crew) {
        return res.status(404).json({ message: "Crew not found" });
      }
      res.json(crew);
    } catch (error) {
      console.error("Error fetching crew:", error);
      res.status(500).json({ message: "Failed to fetch crew" });
    }
  });

  app.post("/api/crews", async (req, res) => {
    try {
      const validated = insertCrewSchema.parse(req.body);
      const crew = await storage.createCrew(validated);
      res.status(201).json(crew);
    } catch (error) {
      console.error("Error creating crew:", error);
      res.status(400).json({ message: "Invalid crew data" });
    }
  });

  app.put("/api/crews/:id", async (req, res) => {
    try {
      const validated = insertCrewSchema.partial().parse(req.body);
      const crew = await storage.updateCrew(req.params.id, validated);
      res.json(crew);
    } catch (error) {
      console.error("Error updating crew:", error);
      res.status(400).json({ message: "Invalid crew data" });
    }
  });

  app.delete("/api/crews/:id", async (req, res) => {
    try {
      await storage.deleteCrew(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting crew:", error);
      res.status(500).json({ message: "Failed to delete crew" });
    }
  });

  // Crew member management
  app.post("/api/crews/:id/members", async (req, res) => {
    try {
      const { agentId, order } = req.body;
      await storage.addCrewMember(req.params.id, agentId, order);
      res.status(201).json({ message: "Member added successfully" });
    } catch (error) {
      console.error("Error adding crew member:", error);
      res.status(400).json({ message: "Failed to add crew member" });
    }
  });

  app.delete("/api/crews/:crewId/members/:agentId", async (req, res) => {
    try {
      await storage.removeCrewMember(req.params.crewId, req.params.agentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing crew member:", error);
      res.status(500).json({ message: "Failed to remove crew member" });
    }
  });

  // Crew task management
  app.post("/api/crews/:id/tasks", async (req, res) => {
    try {
      const { taskId, order } = req.body;
      await storage.addCrewTask(req.params.id, taskId, order);
      res.status(201).json({ message: "Task added successfully" });
    } catch (error) {
      console.error("Error adding crew task:", error);
      res.status(400).json({ message: "Failed to add crew task" });
    }
  });

  app.delete("/api/crews/:crewId/tasks/:taskId", async (req, res) => {
    try {
      await storage.removeCrewTask(req.params.crewId, req.params.taskId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing crew task:", error);
      res.status(500).json({ message: "Failed to remove crew task" });
    }
  });

  // Execution endpoints
  app.get("/api/executions", async (req, res) => {
    try {
      const executions = await storage.getExecutions();
      res.json(executions);
    } catch (error) {
      console.error("Error fetching executions:", error);
      res.status(500).json({ message: "Failed to fetch executions" });
    }
  });

  app.get("/api/executions/:id", async (req, res) => {
    try {
      const execution = await storage.getExecution(req.params.id);
      if (!execution) {
        return res.status(404).json({ message: "Execution not found" });
      }
      res.json(execution);
    } catch (error) {
      console.error("Error fetching execution:", error);
      res.status(500).json({ message: "Failed to fetch execution" });
    }
  });

  app.get("/api/executions/:id/tasks", async (req, res) => {
    try {
      const taskExecutions = await storage.getTaskExecutions(req.params.id);
      res.json(taskExecutions);
    } catch (error) {
      console.error("Error fetching task executions:", error);
      res.status(500).json({ message: "Failed to fetch task executions" });
    }
  });

  app.post("/api/executions", async (req, res) => {
    try {
      const validated = insertExecutionSchema.parse(req.body);
      const execution = await storage.createExecution(validated);
      res.status(201).json(execution);
    } catch (error) {
      console.error("Error creating execution:", error);
      res.status(400).json({ message: "Invalid execution data" });
    }
  });

  app.put("/api/executions/:id", async (req, res) => {
    try {
      const validated = insertExecutionSchema.partial().parse(req.body);
      const execution = await storage.updateExecution(req.params.id, validated);
      res.json(execution);
    } catch (error) {
      console.error("Error updating execution:", error);
      res.status(400).json({ message: "Invalid execution data" });
    }
  });

  // Knowledge base endpoints
  app.get("/api/knowledge", async (req, res) => {
    try {
      const items = await storage.getKnowledgeItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching knowledge items:", error);
      res.status(500).json({ message: "Failed to fetch knowledge items" });
    }
  });

  app.get("/api/knowledge/:id", async (req, res) => {
    try {
      const item = await storage.getKnowledgeItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Knowledge item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching knowledge item:", error);
      res.status(500).json({ message: "Failed to fetch knowledge item" });
    }
  });

  app.post("/api/knowledge", async (req, res) => {
    try {
      const validated = insertKnowledgeItemSchema.parse(req.body);
      const item = await storage.createKnowledgeItem(validated);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating knowledge item:", error);
      res.status(400).json({ message: "Invalid knowledge item data" });
    }
  });

  app.put("/api/knowledge/:id", async (req, res) => {
    try {
      const validated = insertKnowledgeItemSchema.partial().parse(req.body);
      const item = await storage.updateKnowledgeItem(req.params.id, validated);
      res.json(item);
    } catch (error) {
      console.error("Error updating knowledge item:", error);
      res.status(400).json({ message: "Invalid knowledge item data" });
    }
  });

  app.delete("/api/knowledge/:id", async (req, res) => {
    try {
      await storage.deleteKnowledgeItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting knowledge item:", error);
      res.status(500).json({ message: "Failed to delete knowledge item" });
    }
  });

  // LLM configuration endpoints
  app.get("/api/llm/configurations", async (req, res) => {
    try {
      const configs = await storage.getLlmConfigurations();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching LLM configurations:", error);
      res.status(500).json({ message: "Failed to fetch LLM configurations" });
    }
  });

  app.get("/api/llm/configurations/:id", async (req, res) => {
    try {
      const config = await storage.getLlmConfiguration(req.params.id);
      if (!config) {
        return res.status(404).json({ message: "LLM configuration not found" });
      }
      res.json(config);
    } catch (error) {
      console.error("Error fetching LLM configuration:", error);
      res.status(500).json({ message: "Failed to fetch LLM configuration" });
    }
  });

  app.post("/api/llm/configurations", async (req, res) => {
    try {
      const validated = insertLlmConfigurationSchema.parse(req.body);
      const config = await storage.createLlmConfiguration(validated);
      res.status(201).json(config);
    } catch (error) {
      console.error("Error creating LLM configuration:", error);
      res.status(400).json({ message: "Invalid LLM configuration data" });
    }
  });

  app.put("/api/llm/configurations/:id", async (req, res) => {
    try {
      const validated = insertLlmConfigurationSchema.partial().parse(req.body);
      const config = await storage.updateLlmConfiguration(req.params.id, validated);
      res.json(config);
    } catch (error) {
      console.error("Error updating LLM configuration:", error);
      res.status(400).json({ message: "Invalid LLM configuration data" });
    }
  });

  app.delete("/api/llm/configurations/:id", async (req, res) => {
    try {
      await storage.deleteLlmConfiguration(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting LLM configuration:", error);
      res.status(500).json({ message: "Failed to delete LLM configuration" });
    }
  });

  // Enhanced LLM provider endpoints with real AI services
  app.get("/api/llm/providers", async (req, res) => {
    try {
      const providers = await aiServiceManager.getProviders();
      const formattedProviders = providers.map(p => ({
        name: p.name,
        model: p.models[0] || 'Unknown',
        status: p.status,
        type: p.type === 'openai' || p.type === 'anthropic' || p.type === 'groq' ? 'cloud' : 'local',
        icon: p.type === 'groq' ? 'bolt' : 
              p.type === 'ollama' ? 'server' :
              p.type === 'openai' ? 'openai' : 'brain',
        responseTime: p.responseTime,
        lastHealthCheck: p.lastHealthCheck
      }));
      res.json(formattedProviders);
    } catch (error) {
      console.error("Error fetching LLM providers:", error);
      res.status(500).json({ message: "Failed to fetch LLM providers" });
    }
  });

  // AI Generation endpoints
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { messages, provider, model, maxTokens, temperature } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Messages array is required" });
      }

      const response = await aiServiceManager.generateResponse({
        messages,
        provider,
        model,
        maxTokens,
        temperature
      });

      res.json(response);
    } catch (error) {
      console.error("Error generating AI response:", error);
      res.status(500).json({ message: "Failed to generate response" });
    }
  });

  app.post("/api/ai/suggest-agent", async (req, res) => {
    try {
      const { taskDescription, availableAgents } = req.body;
      
      if (!taskDescription || !availableAgents) {
        return res.status(400).json({ message: "Task description and available agents are required" });
      }

      const suggestion = await aiServiceManager.suggestAgentForTask(taskDescription, availableAgents);
      res.json(suggestion);
    } catch (error) {
      console.error("Error suggesting agent:", error);
      res.status(500).json({ message: "Failed to suggest agent" });
    }
  });

  app.post("/api/ai/suggest-crew", async (req, res) => {
    try {
      const { projectDescription, availableAgents } = req.body;
      
      if (!projectDescription || !availableAgents) {
        return res.status(400).json({ message: "Project description and available agents are required" });
      }

      const suggestion = await aiServiceManager.generateCrewSuggestion(projectDescription, availableAgents);
      res.json(suggestion);
    } catch (error) {
      console.error("Error suggesting crew:", error);
      res.status(500).json({ message: "Failed to suggest crew" });
    }
  });

  // CrewAI Execution endpoints
  app.post("/api/crews/:id/execute", async (req, res) => {
    try {
      const crewId = req.params.id;
      const { input, projectId } = req.body;

      // Get crew, agents, and tasks
      const crew = await storage.getCrew(crewId);
      if (!crew) {
        return res.status(404).json({ message: "Crew not found" });
      }

      // Get agents and tasks for this crew (simplified - would need proper many-to-many queries)
      const agents = await storage.getAgents();
      const tasks = await storage.getTasks();

      // Validate crew configuration
      const validation = await crewAIService.validateCrewConfiguration(crew, agents, tasks);
      if (!validation.isValid) {
        return res.status(400).json({
          message: "Invalid crew configuration",
          errors: validation.errors,
          warnings: validation.warnings
        });
      }

      // Execute the crew
      const result = await crewAIService.executeCrewWorkflow({
        crew,
        agents,
        tasks,
        input,
        projectId
      });

      res.json(result);
    } catch (error) {
      console.error("Error executing crew:", error);
      res.status(500).json({ message: "Failed to execute crew" });
    }
  });

  app.post("/api/crews/:id/validate", async (req, res) => {
    try {
      const crewId = req.params.id;

      const crew = await storage.getCrew(crewId);
      if (!crew) {
        return res.status(404).json({ message: "Crew not found" });
      }

      const agents = await storage.getAgents();
      const tasks = await storage.getTasks();

      const validation = await crewAIService.validateCrewConfiguration(crew, agents, tasks);
      res.json(validation);
    } catch (error) {
      console.error("Error validating crew:", error);
      res.status(500).json({ message: "Failed to validate crew" });
    }
  });

  // Knowledge processing endpoints
  app.post("/api/knowledge/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { projectId, agentId, tags } = req.body;
      
      const metadata = {
        projectId,
        agentId,
        sourceFile: req.file.originalname,
        fileType: path.extname(req.file.originalname).slice(1),
        tags: tags ? JSON.parse(tags) : []
      };

      const result = await knowledgeProcessor.processUploadedFile(
        req.file.path,
        metadata
      );

      if (result.success) {
        // Create knowledge item record
        const knowledgeItem = await storage.createKnowledgeItem({
          title: req.file.originalname,
          content: `Processed file: ${req.file.originalname}`,
          fileUrl: req.file.path,
          fileType: metadata.fileType,
          fileSize: req.file.size,
          metadata: {
            vectorIds: result.vectorIds,
            documentsCreated: result.documentsCreated
          }
        });

        res.json({
          success: true,
          knowledgeItem,
          processing: result
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error("Error uploading knowledge file:", error);
      res.status(500).json({ message: "Failed to upload and process file" });
    }
  });

  app.post("/api/knowledge/search", async (req, res) => {
    try {
      const { query, projectId, agentId, limit, threshold } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      const results = await knowledgeProcessor.searchKnowledge(query, {
        projectId,
        agentId,
        limit,
        threshold
      });

      res.json(results);
    } catch (error) {
      console.error("Error searching knowledge:", error);
      res.status(500).json({ message: "Failed to search knowledge" });
    }
  });

  app.get("/api/knowledge/stats", async (req, res) => {
    try {
      const stats = await knowledgeProcessor.getKnowledgeStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting knowledge stats:", error);
      res.status(500).json({ message: "Failed to get knowledge statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
