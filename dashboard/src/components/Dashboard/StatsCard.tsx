import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "warning" | "success" | "info";
}

export const StatsCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatsCardProps) => {
  const variantStyles = {
    default: "border-primary/30 hover:shadow-xl hover:shadow-primary/10",
    warning: "border-accent/30 hover:shadow-xl hover:shadow-accent/10",
    success: "border-success/30 hover:shadow-xl hover:shadow-success/10",
    info: "border-secondary/30 hover:shadow-xl hover:shadow-secondary/10"
  };

  const iconColors = {
    default: "from-primary to-secondary",
    warning: "from-accent to-primary",
    success: "from-success to-primary",
    info: "from-secondary to-accent"
  };

  return (
    <Card className={`p-6 bg-card border-2 ${variantStyles[variant]} hover:-translate-y-2 transition-all duration-300 group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1 group-hover:text-foreground transition-colors">{title}</p>
          <p className="text-3xl font-bold group-hover:scale-110 transition-transform inline-block">{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${iconColors[variant]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};
