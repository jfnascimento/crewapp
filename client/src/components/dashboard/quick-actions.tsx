import { Plus, Bot, Upload } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuickActions() {
  const actions = [
    {
      title: "Create New Crew",
      description: "Design AI agent team",
      icon: Plus,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      testId: "action-create-crew",
    },
    {
      title: "Add Agent",
      description: "Create specialized AI agent",
      icon: Bot,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      testId: "action-add-agent",
    },
    {
      title: "Upload Knowledge",
      description: "Add training documents",
      icon: Upload,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      testId: "action-upload-knowledge",
    },
  ];

  return (
    <Card data-testid="quick-actions">
      <CardHeader className="border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              variant="outline"
              className="w-full flex items-center space-x-3 p-3 h-auto justify-start"
              data-testid={action.testId}
            >
              <div className={`w-8 h-8 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={`${action.iconColor} w-4 h-4`} />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
