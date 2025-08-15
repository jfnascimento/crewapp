import { Users, Cog, Search, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Execution } from "@shared/schema";

interface RecentExecutionsProps {
  executions?: Execution[];
  isLoading: boolean;
}

export default function RecentExecutions({ executions, isLoading }: RecentExecutionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock execution data for demo
  const mockExecutions = [
    {
      id: "1",
      crewName: "Content Marketing Team",
      description: "Blog post generation and SEO optimization",
      startTime: "Started 2 hours ago",
      duration: "Duration: 45 min",
      status: "completed" as const,
      icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      id: "2", 
      crewName: "Data Analysis Crew",
      description: "Customer insights and reporting",
      startTime: "Started 30 min ago",
      progress: "Progress: 75%",
      status: "running" as const,
      icon: Cog,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      id: "3",
      crewName: "Research Team", 
      description: "Market trend analysis",
      startTime: "Queued",
      estimatedTime: "Est. 20 min",
      status: "pending" as const,
      icon: Search,
      iconBg: "bg-purple-100", 
      iconColor: "text-purple-600",
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "running":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "running":
        return "Running";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  return (
    <Card data-testid="recent-executions">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recent Executions</h3>
          <Button variant="link" size="sm" data-testid="view-all-executions">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {mockExecutions.map((execution) => {
            const Icon = execution.icon;
            return (
              <div 
                key={execution.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                data-testid={`execution-${execution.id}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 ${execution.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`${execution.iconColor} w-5 h-5`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{execution.crewName}</h4>
                    <p className="text-sm text-muted-foreground">{execution.description}</p>
                    <div className="flex items-center mt-1 space-x-4 text-xs text-muted-foreground">
                      <span>{execution.startTime}</span>
                      <span>•</span>
                      <span>{execution.duration || execution.progress || execution.estimatedTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusVariant(execution.status)}>
                    {getStatusText(execution.status)}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
