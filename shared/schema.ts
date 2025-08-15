import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  real,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const executionStatusEnum = pgEnum("execution_status", [
  "pending",
  "running", 
  "completed",
  "failed",
  "cancelled"
]);

export const llmProviderEnum = pgEnum("llm_provider", [
  "groq",
  "ollama", 
  "openai",
  "anthropic"
]);

export const agentRoleEnum = pgEnum("agent_role", [
  "researcher",
  "writer",
  "analyst",
  "reviewer",
  "coordinator",
  "specialist"
]);

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("active"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agents table
export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  role: agentRoleEnum("role").notNull(),
  goal: text("goal").notNull(),
  backstory: text("backstory").notNull(),
  llmProvider: llmProviderEnum("llm_provider").notNull(),
  llmModel: varchar("llm_model", { length: 100 }).notNull(),
  maxTokens: integer("max_tokens").default(1000),
  temperature: real("temperature").default(0.7),
  allowDelegation: boolean("allow_delegation").default(false),
  enableReasoning: boolean("enable_reasoning").default(false),
  isMultimodal: boolean("is_multimodal").default(false),
  tools: jsonb("tools").default("[]"),
  systemPrompt: text("system_prompt"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  expectedOutput: text("expected_output"),
  agentId: varchar("agent_id").references(() => agents.id),
  context: jsonb("context").default("[]"),
  outputFormat: varchar("output_format", { length: 50 }).default("text"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Crews table
export const crews = pgTable("crews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  process: varchar("process", { length: 50 }).default("sequential"),
  maxIterations: integer("max_iterations").default(1),
  verboseLogging: boolean("verbose_logging").default(false),
  projectId: varchar("project_id").references(() => projects.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Crew Members (Many-to-Many between Crews and Agents)
export const crewMembers = pgTable("crew_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  crewId: varchar("crew_id").references(() => crews.id, { onDelete: "cascade" }),
  agentId: varchar("agent_id").references(() => agents.id, { onDelete: "cascade" }),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Crew Tasks (Many-to-Many between Crews and Tasks)
export const crewTasks = pgTable("crew_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  crewId: varchar("crew_id").references(() => crews.id, { onDelete: "cascade" }),
  taskId: varchar("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Executions table
export const executions = pgTable("executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  crewId: varchar("crew_id").references(() => crews.id),
  status: executionStatusEnum("status").default("pending"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // in seconds
  input: jsonb("input"),
  output: jsonb("output"),
  errorMessage: text("error_message"),
  tokenUsage: jsonb("token_usage"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Task Executions (Individual task runs within a crew execution)
export const taskExecutions = pgTable("task_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  executionId: varchar("execution_id").references(() => executions.id, { onDelete: "cascade" }),
  taskId: varchar("task_id").references(() => tasks.id),
  agentId: varchar("agent_id").references(() => agents.id),
  status: executionStatusEnum("status").default("pending"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"),
  input: text("input"),
  output: text("output"),
  errorMessage: text("error_message"),
  tokenUsage: jsonb("token_usage"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Knowledge Base Items
export const knowledgeItems = pgTable("knowledge_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  fileUrl: varchar("file_url"),
  fileType: varchar("file_type", { length: 100 }),
  fileSize: integer("file_size"),
  vectorId: varchar("vector_id"), // Reference to Qdrant vector
  metadata: jsonb("metadata"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// LLM Provider Configurations
export const llmConfigurations = pgTable("llm_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: llmProviderEnum("provider").notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  apiKey: varchar("api_key"),
  baseUrl: varchar("base_url"),
  maxTokens: integer("max_tokens").default(1000),
  temperature: real("temperature").default(0.7),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  crews: many(crews),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [agents.createdBy],
    references: [users.id],
  }),
  crewMembers: many(crewMembers),
  tasks: many(tasks),
  taskExecutions: many(taskExecutions),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  agent: one(agents, {
    fields: [tasks.agentId],
    references: [agents.id],
  }),
  createdBy: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
  crewTasks: many(crewTasks),
  taskExecutions: many(taskExecutions),
}));

export const crewsRelations = relations(crews, ({ one, many }) => ({
  project: one(projects, {
    fields: [crews.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [crews.createdBy],
    references: [users.id],
  }),
  crewMembers: many(crewMembers),
  crewTasks: many(crewTasks),
  executions: many(executions),
}));

export const crewMembersRelations = relations(crewMembers, ({ one }) => ({
  crew: one(crews, {
    fields: [crewMembers.crewId],
    references: [crews.id],
  }),
  agent: one(agents, {
    fields: [crewMembers.agentId],
    references: [agents.id],
  }),
}));

export const crewTasksRelations = relations(crewTasks, ({ one }) => ({
  crew: one(crews, {
    fields: [crewTasks.crewId],
    references: [crews.id],
  }),
  task: one(tasks, {
    fields: [crewTasks.taskId],
    references: [tasks.id],
  }),
}));

export const executionsRelations = relations(executions, ({ one, many }) => ({
  crew: one(crews, {
    fields: [executions.crewId],
    references: [crews.id],
  }),
  createdBy: one(users, {
    fields: [executions.createdBy],
    references: [users.id],
  }),
  taskExecutions: many(taskExecutions),
}));

export const taskExecutionsRelations = relations(taskExecutions, ({ one }) => ({
  execution: one(executions, {
    fields: [taskExecutions.executionId],
    references: [executions.id],
  }),
  task: one(tasks, {
    fields: [taskExecutions.taskId],
    references: [tasks.id],
  }),
  agent: one(agents, {
    fields: [taskExecutions.agentId],
    references: [agents.id],
  }),
}));

export const knowledgeItemsRelations = relations(knowledgeItems, ({ one }) => ({
  createdBy: one(users, {
    fields: [knowledgeItems.createdBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCrewSchema = createInsertSchema(crews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExecutionSchema = createInsertSchema(executions).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeItemSchema = createInsertSchema(knowledgeItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLlmConfigurationSchema = createInsertSchema(llmConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Crew = typeof crews.$inferSelect;
export type InsertCrew = z.infer<typeof insertCrewSchema>;

export type Execution = typeof executions.$inferSelect;
export type InsertExecution = z.infer<typeof insertExecutionSchema>;

export type TaskExecution = typeof taskExecutions.$inferSelect;

export type KnowledgeItem = typeof knowledgeItems.$inferSelect;
export type InsertKnowledgeItem = z.infer<typeof insertKnowledgeItemSchema>;

export type LlmConfiguration = typeof llmConfigurations.$inferSelect;
export type InsertLlmConfiguration = z.infer<typeof insertLlmConfigurationSchema>;
