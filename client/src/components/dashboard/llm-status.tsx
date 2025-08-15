import { Zap, Server, Cpu, Brain } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LlmStatusProps {
  providers?: Array<{
    name: string;
    model: string;
    status: string;
    type: string;
    icon: string;
  }>;
  isLoading: boolean;
}

export default function LlmStatus({ providers, isLoading }: LlmStatusProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
    <Card data-testid="llm-status">
      <CardHeader className="border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">LLM Providers</h3>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {providers?.map((provider) => {
            const Icon = getIcon(provider.icon);
            return (
              <div key={provider.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getIconBg(provider.icon)} rounded-lg flex items-center justify-center`}>
                    <Icon className={`${getIconColor(provider.icon)} w-4 h-4`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{provider.name}</p>
                    <p className="text-xs text-muted-foreground">{provider.model}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-xs text-muted-foreground">
                    {provider.type === "local" ? "Local" : "Online"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
