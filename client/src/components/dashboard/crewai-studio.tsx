import { Compass, Eye, Wand2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CrewAIStudio() {
  const features = [
    {
      title: "Visual Crew Designer",
      description: "Drag-and-drop interface to design complex agent workflows and task dependencies",
      icon: Compass,
      gradient: "from-primary/5 to-primary/10",
      border: "border-primary/20",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      linkColor: "text-primary",
    },
    {
      title: "Real-time Monitoring",
      description: "Watch your agents execute tasks in real-time with detailed performance metrics",
      icon: Eye,
      gradient: "from-accent/5 to-accent/10",
      border: "border-accent/20",
      iconBg: "bg-accent/20",
      iconColor: "text-accent",
      linkColor: "text-accent",
    },
    {
      title: "AI Recommendations",
      description: "Get intelligent suggestions for agent configurations and LLM selections",
      icon: Wand2,
      gradient: "from-orange-50 to-orange-100",
      border: "border-orange-200",
      iconBg: "bg-orange-200",
      iconColor: "text-orange-600",
      linkColor: "text-orange-600",
    },
  ];

  return (
    <Card className="mt-8" data-testid="crewai-studio">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">CrewAI Studio</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Visual interface for designing and managing AI agent crews
            </p>
          </div>
          <Button data-testid="launch-studio">
            <span className="mr-2">Launch Studio</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.title}
                className={`p-6 bg-gradient-to-br ${feature.gradient} rounded-xl border ${feature.border} hover:shadow-sm transition-shadow cursor-pointer`}
                data-testid={`studio-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`${feature.iconColor} w-6 h-6`} />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <div className={`flex items-center text-sm ${feature.linkColor} hover:opacity-80 transition-opacity`}>
                  <span className="mr-2">Learn more</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
