import {
  users,
  projects,
  agents,
  tasks,
  crews,
  crewMembers,
  crewTasks,
  executions,
  taskExecutions,
  knowledgeItems,
  llmConfigurations,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Agent,
  type InsertAgent,
  type Task,
  type InsertTask,
  type Crew,
  type InsertCrew,
  type Execution,
  type InsertExecution,
  type TaskExecution,
  type KnowledgeItem,
  type InsertKnowledgeItem,
  type LlmConfiguration,
  type InsertLlmConfiguration,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Agent operations
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, updates: Partial<InsertAgent>): Promise<Agent>;
  deleteAgent(id: string): Promise<void>;

  // Task operations
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Crew operations
  getCrews(): Promise<Crew[]>;
  getCrew(id: string): Promise<Crew | undefined>;
  createCrew(crew: InsertCrew): Promise<Crew>;
  updateCrew(id: string, updates: Partial<InsertCrew>): Promise<Crew>;
  deleteCrew(id: string): Promise<void>;
  addCrewMember(crewId: string, agentId: string, order?: number): Promise<void>;
  removeCrewMember(crewId: string, agentId: string): Promise<void>;
  addCrewTask(crewId: string, taskId: string, order?: number): Promise<void>;
  removeCrewTask(crewId: string, taskId: string): Promise<void>;

  // Execution operations
  getExecutions(): Promise<Execution[]>;
  getExecution(id: string): Promise<Execution | undefined>;
  createExecution(execution: InsertExecution): Promise<Execution>;
  updateExecution(id: string, updates: Partial<InsertExecution>): Promise<Execution>;
  getTaskExecutions(executionId: string): Promise<TaskExecution[]>;

  // Knowledge base operations
  getKnowledgeItems(): Promise<KnowledgeItem[]>;
  getKnowledgeItem(id: string): Promise<KnowledgeItem | undefined>;
  createKnowledgeItem(item: InsertKnowledgeItem): Promise<KnowledgeItem>;
  updateKnowledgeItem(id: string, updates: Partial<InsertKnowledgeItem>): Promise<KnowledgeItem>;
  deleteKnowledgeItem(id: string): Promise<void>;

  // LLM configuration operations
  getLlmConfigurations(): Promise<LlmConfiguration[]>;
  getLlmConfiguration(id: string): Promise<LlmConfiguration | undefined>;
  createLlmConfiguration(config: InsertLlmConfiguration): Promise<LlmConfiguration>;
  updateLlmConfiguration(id: string, updates: Partial<InsertLlmConfiguration>): Promise<LlmConfiguration>;
  deleteLlmConfiguration(id: string): Promise<void>;

  // Dashboard statistics
  getDashboardStats(): Promise<{
    activeCrews: number;
    totalAgents: number;
    executionsToday: number;
    llmProviders: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Agent operations
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents).orderBy(desc(agents.createdAt));
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }

  async updateAgent(id: string, updates: Partial<InsertAgent>): Promise<Agent> {
    const [updated] = await db
      .update(agents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return updated;
  }

  async deleteAgent(id: string): Promise<void> {
    await db.delete(agents).where(eq(agents.id, id));
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task> {
    const [updated] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Crew operations
  async getCrews(): Promise<Crew[]> {
    return await db.select().from(crews).orderBy(desc(crews.createdAt));
  }

  async getCrew(id: string): Promise<Crew | undefined> {
    const [crew] = await db.select().from(crews).where(eq(crews.id, id));
    return crew;
  }

  async createCrew(crew: InsertCrew): Promise<Crew> {
    const [newCrew] = await db.insert(crews).values(crew).returning();
    return newCrew;
  }

  async updateCrew(id: string, updates: Partial<InsertCrew>): Promise<Crew> {
    const [updated] = await db
      .update(crews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(crews.id, id))
      .returning();
    return updated;
  }

  async deleteCrew(id: string): Promise<void> {
    await db.delete(crews).where(eq(crews.id, id));
  }

  async addCrewMember(crewId: string, agentId: string, order: number = 0): Promise<void> {
    await db.insert(crewMembers).values({ crewId, agentId, order });
  }

  async removeCrewMember(crewId: string, agentId: string): Promise<void> {
    await db.delete(crewMembers).where(
      and(eq(crewMembers.crewId, crewId), eq(crewMembers.agentId, agentId))
    );
  }

  async addCrewTask(crewId: string, taskId: string, order: number = 0): Promise<void> {
    await db.insert(crewTasks).values({ crewId, taskId, order });
  }

  async removeCrewTask(crewId: string, taskId: string): Promise<void> {
    await db.delete(crewTasks).where(
      and(eq(crewTasks.crewId, crewId), eq(crewTasks.taskId, taskId))
    );
  }

  // Execution operations
  async getExecutions(): Promise<Execution[]> {
    return await db.select().from(executions).orderBy(desc(executions.createdAt));
  }

  async getExecution(id: string): Promise<Execution | undefined> {
    const [execution] = await db.select().from(executions).where(eq(executions.id, id));
    return execution;
  }

  async createExecution(execution: InsertExecution): Promise<Execution> {
    const [newExecution] = await db.insert(executions).values(execution).returning();
    return newExecution;
  }

  async updateExecution(id: string, updates: Partial<InsertExecution>): Promise<Execution> {
    const [updated] = await db
      .update(executions)
      .set(updates)
      .where(eq(executions.id, id))
      .returning();
    return updated;
  }

  async getTaskExecutions(executionId: string): Promise<TaskExecution[]> {
    return await db.select().from(taskExecutions)
      .where(eq(taskExecutions.executionId, executionId))
      .orderBy(taskExecutions.createdAt);
  }

  // Knowledge base operations
  async getKnowledgeItems(): Promise<KnowledgeItem[]> {
    return await db.select().from(knowledgeItems).orderBy(desc(knowledgeItems.createdAt));
  }

  async getKnowledgeItem(id: string): Promise<KnowledgeItem | undefined> {
    const [item] = await db.select().from(knowledgeItems).where(eq(knowledgeItems.id, id));
    return item;
  }

  async createKnowledgeItem(item: InsertKnowledgeItem): Promise<KnowledgeItem> {
    const [newItem] = await db.insert(knowledgeItems).values(item).returning();
    return newItem;
  }

  async updateKnowledgeItem(id: string, updates: Partial<InsertKnowledgeItem>): Promise<KnowledgeItem> {
    const [updated] = await db
      .update(knowledgeItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(knowledgeItems.id, id))
      .returning();
    return updated;
  }

  async deleteKnowledgeItem(id: string): Promise<void> {
    await db.delete(knowledgeItems).where(eq(knowledgeItems.id, id));
  }

  // LLM configuration operations
  async getLlmConfigurations(): Promise<LlmConfiguration[]> {
    return await db.select().from(llmConfigurations).orderBy(desc(llmConfigurations.createdAt));
  }

  async getLlmConfiguration(id: string): Promise<LlmConfiguration | undefined> {
    const [config] = await db.select().from(llmConfigurations).where(eq(llmConfigurations.id, id));
    return config;
  }

  async createLlmConfiguration(config: InsertLlmConfiguration): Promise<LlmConfiguration> {
    const [newConfig] = await db.insert(llmConfigurations).values(config).returning();
    return newConfig;
  }

  async updateLlmConfiguration(id: string, updates: Partial<InsertLlmConfiguration>): Promise<LlmConfiguration> {
    const [updated] = await db
      .update(llmConfigurations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(llmConfigurations.id, id))
      .returning();
    return updated;
  }

  async deleteLlmConfiguration(id: string): Promise<void> {
    await db.delete(llmConfigurations).where(eq(llmConfigurations.id, id));
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    activeCrews: number;
    totalAgents: number;
    executionsToday: number;
    llmProviders: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeCrewsResult] = await db
      .select({ count: count() })
      .from(crews);

    const [totalAgentsResult] = await db
      .select({ count: count() })
      .from(agents);

    const [executionsTodayResult] = await db
      .select({ count: count() })
      .from(executions)
      .where(sql`${executions.createdAt} >= ${today}`);

    const [llmProvidersResult] = await db
      .select({ count: count() })
      .from(llmConfigurations)
      .where(eq(llmConfigurations.isActive, true));

    return {
      activeCrews: activeCrewsResult.count,
      totalAgents: totalAgentsResult.count,
      executionsToday: executionsTodayResult.count,
      llmProviders: llmProvidersResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
