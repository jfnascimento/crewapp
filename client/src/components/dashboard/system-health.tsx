import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function SystemHealth() {
  const metrics = [
    {
      label: "API Response Time",
      value: "120ms",
      progress: 85,
    },
    {
      label: "Database Status",
      value: "Healthy",
      progress: 95,
    },
    {
      label: "Vector DB",
      value: "Connected",
      progress: 92,
    },
  ];

  return (
    <Card data-testid="system-health">
      <CardHeader className="border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">System Health</h3>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <span className="text-sm font-medium text-accent">{metric.value}</span>
            </div>
            <Progress value={metric.progress} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
