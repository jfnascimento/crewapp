import { useQuery } from "@tanstack/react-query";
import { Search, Bell, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentExecutions from "@/components/dashboard/recent-executions";
import LlmStatus from "@/components/dashboard/llm-status";
import QuickActions from "@/components/dashboard/quick-actions";
import SystemHealth from "@/components/dashboard/system-health";
import CrewAIStudio from "@/components/dashboard/crewai-studio";
import { type Execution } from "@shared/schema";

interface DashboardStats {
  activeCrews: number;
  totalAgents: number;
  executionsToday: number;
  llmProviders: number;
}

interface LlmProvider {
  name: string;
  model: string;
  status: string;
  type: string;
  icon: string;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: executions, isLoading: executionsLoading } = useQuery<Execution[]>({
    queryKey: ["/api/executions"],
  });

  const { data: llmProviders, isLoading: providersLoading } = useQuery<LlmProvider[]>({
    queryKey: ["/api/llm/providers"],
  });

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor your AI agent crews and system performance
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Input
                type="search"
                placeholder="Search crews, agents..."
                className="pl-10 w-80"
                data-testid="search-input"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative" data-testid="notifications-button">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
            </Button>
            
            {/* Create New */}
            <Button data-testid="create-crew-button">
              <Plus className="mr-2 w-4 h-4" />
              Create Crew
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* System Status Cards */}
        <StatsCards stats={stats} isLoading={statsLoading} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Executions */}
          <div className="lg:col-span-2">
            <RecentExecutions executions={executions} isLoading={executionsLoading} />
          </div>

          {/* Right Sidebar Content */}
          <div className="space-y-6">
            <LlmStatus providers={llmProviders} isLoading={providersLoading} />
            <QuickActions />
            <SystemHealth />
          </div>
        </div>

        {/* CrewAI Studio Section */}
        <CrewAIStudio />
      </div>
    </>
  );
}
