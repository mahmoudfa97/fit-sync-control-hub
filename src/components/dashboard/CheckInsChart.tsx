
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  TooltipProps,
  Legend
} from "recharts";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { t } from "@/utils/translations";

interface DailyCheckins {
  name: string;
  value: number;
  avg: number;
}

const data: DailyCheckins[] = [
  { name: "יום ב", value: 120, avg: 90 },
  { name: "יום ג", value: 180, avg: 95 },
  { name: "יום ד", value: 200, avg: 100 },
  { name: "יום ה", value: 290, avg: 105 },
  { name: "יום ו", value: 300, avg: 110 },
  { name: "שבת", value: 280, avg: 130 },
  { name: "יום א", value: 190, avg: 120 },
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3">
        <p className="font-medium">{label}</p>
        <div className="mt-2 space-y-1">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-medium">
                {entry.name === "value" ? "היום" : "ממוצע"}
              </span>
              <span className="text-xs font-medium mr-auto">
                {entry.value} כניסות
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export function CheckInsChart() {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <CardTitle>{t("weeklyCheckIns")}</CardTitle>
            <CardDescription>{t("dailyCheckInsVsAverage")}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {t("thisWeek")}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>טווח זמן</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>השבוע</DropdownMenuItem>
              <DropdownMenuItem>שבוע שעבר</DropdownMenuItem>
              <DropdownMenuItem>שבועיים אחרונים</DropdownMenuItem>
              <DropdownMenuItem>החודש</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-2xl font-bold">1,560</div>
            <div className="text-sm text-muted-foreground">{t("totalWeeklyCheckIns")}</div>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-success">
            <ArrowUpRight className="h-4 w-4" />
            <span>22.4%</span>
            <span className="text-muted-foreground">{t("vsLastWeek")}</span>
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" strokeOpacity={0.2} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickMargin={8}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="ממוצע"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#3b82f6",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
                activeDot={{
                  r: 6,
                  fill: "#3b82f6",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
                name="היום"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
