
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { t } from "@/utils/translations";
import { 
  Cell, 
  Legend, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  TooltipProps 
} from "recharts";

interface MemberGroupData {
  name: string;
  value: number;
  color: string;
}

const data: MemberGroupData[] = [
  { name: "אימון אישי", value: 145, color: "#3b82f6" },
  { name: "פרימיום", value: 380, color: "#22c55e" },
  { name: "סטנדרט", value: 570, color: "#eab308" },
  { name: "בסיסי", value: 152, color: "#ef4444" },
];

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-md shadow-md p-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium">{data.name}</span>
        </div>
        <div className="mt-1">
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-muted-foreground">סה"כ</span>
            <span className="font-medium">{data.value}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">אחוז</span>
            <span className="font-medium">
              {Math.round((data.value / data.reduce((a: number, b: any) => a + b.value, 0)) * 100)}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: { payload?: any[] }) => {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload?.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm">{entry.value}</span>
          <span className="text-sm text-muted-foreground">({entry.payload.value})</span>
        </div>
      ))}
    </div>
  );
};

export function ActiveMembersByGroup() {
  const totalMembers = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>{t("activeMembersByGroup")}</CardTitle>
        <CardDescription>פילוח לקוחות פעילים לפי סוג מנוי</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <div className="text-2xl font-bold">{totalMembers}</div>
          <div className="text-sm text-muted-foreground">סה"כ לקוחות פעילים</div>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
