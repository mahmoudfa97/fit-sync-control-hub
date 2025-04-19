
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { usePrivateFormatter } from "@/utils/formatters";

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

type ChartType = "area" | "bar" | "pie";

interface StatCardProps extends VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  icon: LucideIcon;
  chartType: ChartType;
  chartData: any[];
  chartColor?: string;
  secondaryColor?: string;
  trend?: {
    value: number;
    positive?: boolean;
  };
  className?: string;
  valueIsRaw?: boolean
}

export function StatCardWithChart({
  title,
  value,
  icon: Icon,
  trend,
  chartType,
  chartData,
  chartColor = "#3b82f6",
  secondaryColor = "#60a5fa",
  variant,
  className,
  valueIsRaw,
}: StatCardProps) {
  const renderChart = () => {
    switch(chartType) {
      case "area":
        return (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`colorValue-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={chartColor} 
              fill={`url(#colorValue-${title})`} 
              fillOpacity={1} 
              strokeWidth={2} 
            />
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={chartData}>
            <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={32}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index % 2 === 0 ? chartColor : secondaryColor} 
                />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return null;
    }
  };
  const { formatValue } = usePrivateFormatter()

  const displayValue = valueIsRaw ? formatValue(value) : value
  return (
    <div className={cn(statCardVariants({ variant }), className)}>
      <div className="flex justify-between items-start mb-2">
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
          <h3 className="text-2xl font-bold">{displayValue}</h3>
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
      <div className="h-16 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
