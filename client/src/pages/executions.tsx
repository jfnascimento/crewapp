import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Play, Clock, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Execution } from "@shared/schema";

export default function Executions() {
  const { data: executions = [], isLoading } = useQuery<Execution[]>({
    queryKey: ["/api/executions"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "running":
        return Play;
      case "pending":
        return Clock;
      case "failed":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "running":
        return "secondary";
      case "pending":
        return "outline";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return "N/A";
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Executions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor crew execution history and performance
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search executions..."
                className="pl-10 w-80"
                data-testid="search-executions"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
            
            <Button variant="outline" data-testid="filter-executions">
              <Filter className="mr-2 w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {executions?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No executions found.</p>
              </div>
            ) : (
              executions?.map((execution: Execution) => {
                const StatusIcon = getStatusIcon(execution.status || "pending");
                return (
                  <Card key={execution.id} data-testid={`execution-${execution.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <StatusIcon className="text-primary w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Execution #{execution.id.slice(-8)}</h3>
                            <p className="text-sm text-muted-foreground">
                              Started {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : "Not started"}
                              {execution.duration && ` • Duration: ${formatDuration(execution.duration)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={getStatusVariant(execution.status || "pending")}>
                            {execution.status || "pending"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}
