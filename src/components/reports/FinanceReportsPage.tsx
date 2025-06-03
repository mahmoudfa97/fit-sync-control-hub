
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { PaymentReportPage } from "@/components/reports/PaymentReportPage";

export default function FinanceReportsPage() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportType, setReportType] = useState("revenue");

  const handleGenerateReport = () => {
    console.log("Generating finance report:", { startDate, endDate, reportType });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הכנסות החודש</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪45,231</div>
            <p className="text-xs text-muted-foreground">
              +20.1% מהחודש הקודם
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הוצאות החודש</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪12,234</div>
            <p className="text-xs text-muted-foreground">
              +4% מהחודש הקודם
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">רווח נקי</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪32,997</div>
            <p className="text-xs text-muted-foreground">
              +12% מהחודש הקודם
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            יצירת דוח כספי מותאם אישית
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">תאריך התחלה</label>
              <DatePicker date={startDate} onSelect={setStartDate} />
            </div>
            <div>
              <label className="text-sm font-medium">תאריך סיום</label>
              <DatePicker date={endDate} onSelect={setEndDate} />
            </div>
            <div>
              <label className="text-sm font-medium">סוג דוח</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג דוח" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">דוח הכנסות</SelectItem>
                  <SelectItem value="expenses">דוח הוצאות</SelectItem>
                  <SelectItem value="profit">דוח רווח</SelectItem>
                  <SelectItem value="cash-flow">דוח תזרים מזומנים</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerateReport} className="w-full">
            צור דוח
          </Button>
        </CardContent>
      </Card>

      <PaymentReportPage />
    </div>
  );
}
