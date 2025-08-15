import { aiServiceManager } from './ai-services';
import { knowledgeProcessor } from './knowledge-processor';
import { storage } from './storage';
import type { Crew, Agent, Task, Execution, InsertExecution } from '@shared/schema';

export interface CrewExecutionContext {
  crew: Crew;
  agents: Agent[];
  tasks: Task[];
  input: any;
  projectId?: string;
}

export interface TaskExecutionResult {
  taskId: string;
  agentId: string;
  output: string;
  duration: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export interface CrewExecutionResult {
  executionId: string;
  status: 'completed' | 'failed' | 'cancelled';
  output: any;
  taskResults: TaskExecutionResult[];
  totalDuration: number;
  totalTokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

class CrewAIService {
  async executeCrewWorkflow(context: CrewExecutionContext): Promise<CrewExecutionResult> {
    const startTime = Date.now();
    
    // Create execution record
    const executionData: InsertExecution = {
      crewId: context.crew.id,
      status: 'running',
      startedAt: new Date(),
      input: context.input,
      createdBy: null // Would be set from auth context in production
    };

    const execution = await storage.createExecution(executionData);
    
    try {
      let taskResults: TaskExecutionResult[] = [];
      let totalTokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      // Execute tasks based on crew process
      if (context.crew.process === 'sequential') {
        taskResults = await this.executeSequentialTasks(context, execution.id);
      } else if (context.crew.process === 'hierarchical') {
        taskResults = await this.executeHierarchicalTasks(context, execution.id);
      } else {
        throw new Error(`Unsupported process type: ${context.crew.process}`);
      }

      // Calculate total usage
      taskResults.forEach(result => {
        if (result.tokenUsage) {
          totalTokenUsage.promptTokens += result.tokenUsage.promptTokens;
          totalTokenUsage.completionTokens += result.tokenUsage.completionTokens;
          totalTokenUsage.totalTokens += result.tokenUsage.totalTokens;
        }
      });

      const totalDuration = Date.now() - startTime;
      const finalOutput = this.aggregateTaskOutputs(taskResults);

      // Update execution record
      await storage.updateExecution(execution.id, {
        status: 'completed',
        completedAt: new Date(),
        duration: Math.round(totalDuration / 1000),
        output: finalOutput,
        tokenUsage: totalTokenUsage
      });

      return {
        executionId: execution.id,
        status: 'completed',
        output: finalOutput,
        taskResults,
        totalDuration,
        totalTokenUsage
      };

    } catch (error) {
      console.error('Crew execution failed:', error);

      // Update execution record with error
      await storage.updateExecution(execution.id, {
        status: 'failed',
        completedAt: new Date(),
        duration: Math.round((Date.now() - startTime) / 1000),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        executionId: execution.id,
        status: 'failed',
        output: null,
        taskResults: [],
        totalDuration: Date.now() - startTime,
        totalTokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async executeSequentialTasks(
    context: CrewExecutionContext, 
    executionId: string
  ): Promise<TaskExecutionResult[]> {
    const results: TaskExecutionResult[] = [];
    let previousContext = '';

    for (let i = 0; i < context.tasks.length; i++) {
      const task = context.tasks[i];
      const agent = context.agents.find(a => a.id === task.agentId);
      
      if (!agent) {
        throw new Error(`Agent not found for task: ${task.id}`);
      }

      const taskResult = await this.executeTask(
        task, 
        agent, 
        {
          input: context.input,
          previousContext,
          projectId: context.projectId
        },
        executionId
      );

      results.push(taskResult);
      
      // Pass output as context to next task
      previousContext += `\nPrevious Task Output (${task.title}):\n${taskResult.output}\n`;

      // If task failed, stop execution
      if (taskResult.error) {
        throw new Error(`Task ${task.title} failed: ${taskResult.error}`);
      }
    }

    return results;
  }

  private async executeHierarchicalTasks(
    context: CrewExecutionContext, 
    executionId: string
  ): Promise<TaskExecutionResult[]> {
    // For hierarchical execution, we'll need a manager agent to coordinate
    // For now, implement as sequential with enhanced coordination
    
    const managerAgent = context.agents.find(a => a.role === 'coordinator') || context.agents[0];
    const workerAgents = context.agents.filter(a => a.id !== managerAgent.id);

    // Manager creates execution plan
    const planningResult = await this.createExecutionPlan(
      context,
      managerAgent,
      executionId
    );

    // Execute tasks with manager oversight
    const results: TaskExecutionResult[] = [planningResult];
    
    for (const task of context.tasks) {
      const assignedAgent = workerAgents.find(a => a.id === task.agentId) || workerAgents[0];
      
      if (assignedAgent) {
        const taskResult = await this.executeTask(
          task,
          assignedAgent,
          {
            input: context.input,
            managerGuidance: planningResult.output,
            projectId: context.projectId
          },
          executionId
        );
        
        results.push(taskResult);
        
        if (taskResult.error) {
          throw new Error(`Task ${task.title} failed: ${taskResult.error}`);
        }
      }
    }

    return results;
  }

  private async createExecutionPlan(
    context: CrewExecutionContext,
    managerAgent: Agent,
    executionId: string
  ): Promise<TaskExecutionResult> {
    const startTime = Date.now();

    const planningPrompt = `As a project manager, create an execution plan for the following crew:

Crew: ${context.crew.name}
Description: ${context.crew.description}

Available Agents:
${context.agents.map(a => `- ${a.name} (${a.role}): ${a.goal}`).join('\n')}

Tasks to Execute:
${context.tasks.map(t => `- ${t.title}: ${t.description}`).join('\n')}

Project Input: ${JSON.stringify(context.input)}

Create a detailed execution plan that coordinates the agents and tasks effectively.`;

    try {
      const response = await aiServiceManager.generateResponse({
        messages: [
          { role: 'system', content: managerAgent.systemPrompt || 'You are a project coordination expert.' },
          { role: 'user', content: planningPrompt }
        ],
        provider: managerAgent.llmProvider,
        model: managerAgent.llmModel,
        temperature: managerAgent.temperature || 0.7,
        maxTokens: managerAgent.maxTokens || 1000
      });

      return {
        taskId: 'planning-task',
        agentId: managerAgent.id,
        output: response.content,
        duration: Date.now() - startTime,
        tokenUsage: response.usage
      };
    } catch (error) {
      return {
        taskId: 'planning-task',
        agentId: managerAgent.id,
        output: '',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Planning failed'
      };
    }
  }

  private async executeTask(
    task: Task,
    agent: Agent,
    context: {
      input: any;
      previousContext?: string;
      managerGuidance?: string;
      projectId?: string;
    },
    executionId: string
  ): Promise<TaskExecutionResult> {
    const startTime = Date.now();

    try {
      // Get relevant knowledge from knowledge base
      const knowledgeContext = await this.getRelevantKnowledge(
        task.description,
        context.projectId,
        agent.id
      );

      // Build the task prompt
      const taskPrompt = this.buildTaskPrompt(task, context, knowledgeContext);

      // Execute the task using the agent's LLM
      const response = await aiServiceManager.generateResponse({
        messages: [
          { 
            role: 'system', 
            content: this.buildSystemPrompt(agent, task) 
          },
          { role: 'user', content: taskPrompt }
        ],
        provider: agent.llmProvider,
        model: agent.llmModel,
        temperature: agent.temperature || 0.7,
        maxTokens: agent.maxTokens || 1000
      });

      return {
        taskId: task.id,
        agentId: agent.id,
        output: response.content,
        duration: Date.now() - startTime,
        tokenUsage: response.usage
      };

    } catch (error) {
      return {
        taskId: task.id,
        agentId: agent.id,
        output: '',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Task execution failed'
      };
    }
  }

  private async getRelevantKnowledge(
    query: string,
    projectId?: string,
    agentId?: string
  ): Promise<string> {
    try {
      const results = await knowledgeProcessor.searchKnowledge(query, {
        projectId,
        agentId,
        limit: 5,
        threshold: 0.7
      });

      if (results.length === 0) return '';

      return `Relevant Knowledge:\n${results.map(r => 
        `- ${r.content.substring(0, 200)}... (similarity: ${r.similarity.toFixed(2)})`
      ).join('\n')}\n`;
    } catch (error) {
      console.error('Error retrieving knowledge:', error);
      return '';
    }
  }

  private buildSystemPrompt(agent: Agent, task: Task): string {
    let systemPrompt = agent.systemPrompt || `You are ${agent.name}, a ${agent.role}.`;
    
    systemPrompt += `\n\nYour Goal: ${agent.goal}`;
    systemPrompt += `\n\nYour Background: ${agent.backstory}`;
    
    if (agent.allowDelegation) {
      systemPrompt += '\n\nYou can delegate tasks to other team members if needed.';
    }
    
    if (agent.enableReasoning) {
      systemPrompt += '\n\nExplain your reasoning step by step.';
    }

    systemPrompt += `\n\nCurrent Task: ${task.title}`;
    systemPrompt += `\nTask Description: ${task.description}`;
    
    if (task.expectedOutput) {
      systemPrompt += `\nExpected Output: ${task.expectedOutput}`;
    }

    return systemPrompt;
  }

  private buildTaskPrompt(
    task: Task,
    context: {
      input: any;
      previousContext?: string;
      managerGuidance?: string;
    },
    knowledgeContext: string
  ): string {
    let prompt = `Task: ${task.description}\n\n`;
    
    prompt += `Input Data: ${JSON.stringify(context.input, null, 2)}\n\n`;
    
    if (context.previousContext) {
      prompt += `Previous Work Context:\n${context.previousContext}\n\n`;
    }
    
    if (context.managerGuidance) {
      prompt += `Manager Guidance:\n${context.managerGuidance}\n\n`;
    }
    
    if (knowledgeContext) {
      prompt += knowledgeContext + '\n\n';
    }
    
    if (task.expectedOutput) {
      prompt += `Please provide output in the following format: ${task.expectedOutput}\n\n`;
    }
    
    prompt += 'Execute the task and provide your response:';
    
    return prompt;
  }

  private aggregateTaskOutputs(taskResults: TaskExecutionResult[]): any {
    const outputs: any = {
      summary: 'Crew execution completed',
      taskOutputs: {},
      overallResult: ''
    };

    taskResults.forEach(result => {
      outputs.taskOutputs[result.taskId] = {
        output: result.output,
        duration: result.duration,
        error: result.error
      };
    });

    // Combine all outputs into overall result
    const validOutputs = taskResults
      .filter(r => !r.error && r.output)
      .map(r => r.output);

    outputs.overallResult = validOutputs.join('\n\n---\n\n');

    return outputs;
  }

  async validateCrewConfiguration(crew: Crew, agents: Agent[], tasks: Task[]): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if crew has agents
    if (agents.length === 0) {
      errors.push('Crew must have at least one agent');
    }

    // Check if crew has tasks
    if (tasks.length === 0) {
      errors.push('Crew must have at least one task');
    }

    // Validate task-agent assignments
    tasks.forEach(task => {
      const assignedAgent = agents.find(a => a.id === task.agentId);
      if (!assignedAgent) {
        errors.push(`Task "${task.title}" is assigned to non-existent agent`);
      }
    });

    // Check for hierarchical process requirements
    if (crew.process === 'hierarchical') {
      const hasCoordinator = agents.some(a => a.role === 'coordinator');
      if (!hasCoordinator) {
        warnings.push('Hierarchical process works best with a coordinator agent');
      }
    }

    // Check for LLM provider availability
    const uniqueProviders = Array.from(new Set(agents.map(a => a.llmProvider)));
    for (const provider of uniqueProviders) {
      try {
        const providers = await aiServiceManager.getProviders();
        const providerInfo = providers.find(p => p.name.toLowerCase() === provider);
        if (!providerInfo || providerInfo.status !== 'online') {
          warnings.push(`LLM provider "${provider}" may not be available`);
        }
      } catch (error) {
        warnings.push(`Could not verify LLM provider "${provider}"`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const crewAIService = new CrewAIService();