import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Zap, Server, Cpu, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface LlmProvider {
  name: string;
  model: string;
  status: string;
  type: string;
  icon: string;
}

export default function LlmProviders() {
  const { data: providers = [], isLoading } = useQuery<LlmProvider[]>({
    queryKey: ["/api/llm/providers"],
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "bolt":
        return Zap;
      case "server":
        return Server;
      case "openai":
        return Cpu;
      case "brain":
        return Brain;
      default:
        return Brain;
    }
  };

  const getIconBg = (iconName: string) => {
    switch (iconName) {
      case "bolt":
        return "bg-blue-100";
      case "server":
        return "bg-orange-100";
      case "openai":
        return "bg-green-100";
      case "brain":
        return "bg-purple-100";
      default:
        return "bg-gray-100";
    }
  };

  const getIconColor = (iconName: string) => {
    switch (iconName) {
      case "bolt":
        return "text-blue-600";
      case "server":
        return "text-orange-600";
      case "openai":
        return "text-green-600";
      case "brain":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">LLM Providers</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage language model providers and configurations
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search providers..."
                className="pl-10 w-80"
                data-testid="search-providers"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
            
            <Button variant="outline" data-testid="filter-providers">
              <Filter className="mr-2 w-4 h-4" />
              Filter
            </Button>
            
            <Button data-testid="add-provider">
              <Plus className="mr-2 w-4 h-4" />
              Add Provider
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers?.map((provider: any) => {
              const Icon = getIcon(provider.icon);
              return (
                <Card key={provider.name} data-testid={`provider-${provider.name.toLowerCase()}`} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${getIconBg(provider.icon)} rounded-lg flex items-center justify-center`}>
                          <Icon className={`${getIconColor(provider.icon)} w-6 h-6`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{provider.name}</h3>
                          <p className="text-sm text-muted-foreground">{provider.model}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <Badge variant="outline">
                          {provider.type === "local" ? "Local" : "Online"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-accent font-medium">Active</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="text-foreground">{provider.type}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
