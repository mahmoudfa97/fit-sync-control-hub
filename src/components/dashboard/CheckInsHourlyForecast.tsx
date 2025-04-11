
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { t } from "@/utils/translations";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  TooltipProps, 
  XAxis, 
  YAxis 
} from "recharts";

interface HourlyData {
  hour: string;
  forecast: number;
  actual: number;
}

const data: HourlyData[] = [
  { hour: "06:00", forecast: 12, actual: 14 },
  { hour: "07:00", forecast: 28, actual: 32 },
  { hour: "08:00", forecast: 45, actual: 48 },
  { hour: "09:00", forecast: 38, actual: 35 },
  { hour: "10:00", forecast: 29, actual: 25 },
  { hour: "11:00", forecast: 26, actual: 22 },
  { hour: "12:00", forecast: 35, actual: 32 },
  { hour: "13:00", forecast: 38, actual: 40 },
  { hour: "14:00", forecast: 32, actual: 30 },
  { hour: "15:00", forecast: 28, actual: 26 },
  { hour: "16:00", forecast: 35, actual: 38 },
  { hour: "17:00", forecast: 52, actual: 55 },
  { hour: "18:00", forecast: 60, actual: 62 },
  { hour: "19:00", forecast: 45, actual: 49 },
  { hour: "20:00", forecast: 36, actual: 40 },
  { hour: "21:00", forecast: 25, actual: 28 },
  { hour: "22:00", forecast: 18, actual: 15 },
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
                {entry.name === "forecast" ? "תחזית" : "בפועל"}
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

export function CheckInsHourlyForecast() {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <CardTitle>{t("checkInsHourlyForecast")}</CardTitle>
            <CardDescription>תחזית לעומת כניסות בפועל</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                היום
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>טווח זמן</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>היום</DropdownMenuItem>
              <DropdownMenuItem>אתמול</DropdownMenuItem>
              <DropdownMenuItem>השבוע</DropdownMenuItem>
              <DropdownMenuItem>החודש</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" strokeOpacity={0.2} />
            <XAxis
              dataKey="hour"
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
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#3b82f6"
              fillOpacity={0.3}
              fill="url(#colorForecast)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#22c55e"
              fillOpacity={0.3}
              fill="url(#colorActual)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
