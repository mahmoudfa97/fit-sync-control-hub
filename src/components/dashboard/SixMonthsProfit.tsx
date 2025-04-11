
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
import { ChevronDown, TrendingUp } from "lucide-react";
import { t } from "@/utils/translations";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  TooltipProps, 
  XAxis, 
  YAxis 
} from "recharts";

interface MonthlyProfit {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

const data: MonthlyProfit[] = [
  { month: "נוב", revenue: 45500, expenses: 32000, profit: 13500 },
  { month: "דצמ", revenue: 48700, expenses: 34500, profit: 14200 },
  { month: "ינו", revenue: 52800, expenses: 36200, profit: 16600 },
  { month: "פבר", revenue: 49300, expenses: 33800, profit: 15500 },
  { month: "מרץ", revenue: 54200, expenses: 37000, profit: 17200 },
  { month: "אפר", revenue: 58700, expenses: 39500, profit: 19200 },
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
                {entry.name === "revenue" 
                  ? "הכנסות" 
                  : entry.name === "expenses" 
                    ? "הוצאות" 
                    : "רווח"}
              </span>
              <span className="text-xs font-medium mr-auto">
                {entry.value.toLocaleString()} ₪
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export function SixMonthsProfit() {
  // Calculate total profit
  const totalProfit = data.reduce((sum, month) => sum + month.profit, 0);
  
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("sixMonthsProfit")}</CardTitle>
          <CardDescription>הכנסות, הוצאות ורווח ב-6 חודשים אחרונים</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                6 חודשים
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>טווח זמן</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>3 חודשים</DropdownMenuItem>
              <DropdownMenuItem>6 חודשים</DropdownMenuItem>
              <DropdownMenuItem>שנה</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-2xl font-bold">{totalProfit.toLocaleString()} ₪</div>
            <div className="text-sm text-muted-foreground">סה"כ רווח לתקופה</div>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-success">
            <TrendingUp className="h-4 w-4" />
            <span>12.5%</span>
            <span className="text-muted-foreground">מהתקופה הקודמת</span>
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 10,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" strokeOpacity={0.2} />
              <XAxis
                dataKey="month"
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
                tickFormatter={(value) => `${value / 1000}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="הכנסות" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="הוצאות" />
              <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} name="רווח" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
