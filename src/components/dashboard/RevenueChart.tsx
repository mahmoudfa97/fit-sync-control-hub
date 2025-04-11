
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  TooltipProps
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
import { ChevronDown, DownloadCloud } from "lucide-react";
import { useState } from "react";

interface DataPoint {
  name: string;
  total: number;
  memberships: number;
  classes: number;
  other: number;
}

const data: DataPoint[] = [
  {
    name: "ינו",
    total: 18500,
    memberships: 12000,
    classes: 5000,
    other: 1500,
  },
  {
    name: "פבר",
    total: 20100,
    memberships: 14000,
    classes: 4600,
    other: 1500,
  },
  {
    name: "מרץ",
    total: 19200,
    memberships: 13500,
    classes: 4200,
    other: 1500,
  },
  {
    name: "אפר",
    total: 22800,
    memberships: 16000,
    classes: 5300,
    other: 1500,
  },
  {
    name: "מאי",
    total: 23900,
    memberships: 16500,
    classes: 5900,
    other: 1500,
  },
  {
    name: "יוני",
    total: 25800,
    memberships: 18000,
    classes: 6300,
    other: 1500,
  },
];

type TimeRange = "30d" | "60d" | "90d" | "6m" | "1y";

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
                {entry.name === "memberships" ? "מנויים" : 
                 entry.name === "classes" ? "שיעורים" :
                 entry.name === "other" ? "אחר" : entry.name}
              </span>
              <span className="text-xs font-medium mr-auto">
                ₪{entry.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export function RevenueChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("6m");

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: "30d", label: "30 ימים אחרונים" },
    { value: "60d", label: "60 ימים אחרונים" },
    { value: "90d", label: "90 ימים אחרונים" },
    { value: "6m", label: "6 חודשים אחרונים" },
    { value: "1y", label: "שנה אחרונה" },
  ];

  const selectedRange = timeRangeOptions.find((option) => option.value === timeRange);

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>סקירת הכנסות</CardTitle>
          <CardDescription>פילוח הכנסות חודשי</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {selectedRange?.label}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>טווח זמן</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {timeRangeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon">
            <DownloadCloud className="h-4 w-4" />
            <span className="sr-only">הורד נתונים</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 15,
                left: 10,
                bottom: 15,
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
                tickFormatter={(value) => `₪${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="memberships"
                stackId="a"
                fill="#3b82f6"
                radius={[0, 0, 0, 0]}
                name="מנויים"
              />
              <Bar
                dataKey="classes"
                stackId="a"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
                name="שיעורים"
              />
              <Bar
                dataKey="other"
                stackId="a"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                name="אחר"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
