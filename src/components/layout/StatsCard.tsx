import { DashboardSummary } from "@/types/starter";
import { Card, CardContent } from "../ui/card";

interface IStatsCardProps {
  summary: DashboardSummary;
  valueKey: keyof DashboardSummary;
  title: string;
}
export function StatsCard({ summary, valueKey, title }: IStatsCardProps) {
  return (
    <Card className="rounded-2xl border-border/80 shadow-none bg-card">
      <CardContent className="p-6">
        <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
          {summary?.[valueKey] ?? 0}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">
          {title}
        </p>
      </CardContent>
    </Card>
  );
}
