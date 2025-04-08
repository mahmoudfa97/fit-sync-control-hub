
import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statCardVariants = cva(
  "stat-card flex flex-col",
  {
    variants: {
      variant: {
        default: "border bg-card",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent text-accent-foreground",
        success: "bg-success text-success-foreground",
        info: "bg-info text-info-foreground",
        warning: "bg-warning text-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface StatCardProps extends VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant,
  className,
}: StatCardProps) {
  return (
    <div className={cn(statCardVariants({ variant }), className)}>
      <div className="flex justify-between items-start mb-4">
        <p className={cn(
          "text-sm font-medium",
          variant ? "text-muted-foreground/80" : "text-muted-foreground"
        )}>
          {title}
        </p>
        <Icon className="h-5 w-5 opacity-70" />
      </div>
      <div className="flex items-baseline justify-between">
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span className={cn(
                "text-xs",
                trend.positive ? "text-success" : "text-destructive",
                variant && "text-current opacity-90"
              )}>
                {trend.positive ? "+" : ""}{trend.value}%
              </span>
              <span className={cn(
                "text-xs",
                variant ? "text-current opacity-70" : "text-muted-foreground"
              )}>
                vs last month
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
