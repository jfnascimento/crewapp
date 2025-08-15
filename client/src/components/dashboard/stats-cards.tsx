import { Users, Bot, PlayCircle, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats?: {
    activeCrews: number;
    totalAgents: number;
    executionsToday: number;
    llmProviders: number;
  };
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Active Crews",
      value: stats?.activeCrews || 0,
      change: "+2",
      changeText: "from yesterday",
      icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Total Agents",
      value: stats?.totalAgents || 0,
      change: "+5",
      changeText: "this week",
      icon: Bot,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      title: "Executions Today",
      value: stats?.executionsToday || 0,
      change: "+23%",
      changeText: "success rate",
      icon: PlayCircle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "LLM Providers",
      value: stats?.llmProviders || 0,
      change: "All online",
      changeText: "",
      icon: Brain,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      hasStatusDot: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{card.value}</p>
                  <div className="flex items-center mt-2 text-sm">
                    {card.hasStatusDot && (
                      <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                    )}
                    <span className="text-accent">{card.change}</span>
                    {card.changeText && (
                      <span className="text-muted-foreground ml-1">{card.changeText}</span>
                    )}
                  </div>
                </div>
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.iconColor} w-6 h-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
