
import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinanceReportsPage } from "@/components/reports/FinanceReportsPage";
import { GeneralReportsPage } from "@/components/reports/GeneralReportsPage";
import { MembersReportsPage } from "@/components/reports/MembersReportsPage";
import { PaymentReportPage } from "@/components/reports/PaymentReportPage";
import { FileText, TrendingUp, Users, CreditCard, Download, Clock } from "lucide-react";

export default function ReportsPage() {
  const [reportsHistory, setReportsHistory] = useState<any[]>([]);

  useEffect(() => {
    // For now, we'll use a placeholder for reports history
    // This can be connected to a real table later
    setReportsHistory([]);
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">דוחות</h1>
          <p className="text-muted-foreground">צפה וניהל דוחות שונים של המערכת</p>
        </div>

        <Tabs defaultValue="finance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="finance">דוחות כספיים</TabsTrigger>
            <TabsTrigger value="members">דוחות חברים</TabsTrigger>
            <TabsTrigger value="payments">דוחות תשלומים</TabsTrigger>
            <TabsTrigger value="general">דוחות כלליים</TabsTrigger>
          </TabsList>

          <TabsContent value="finance">
            <FinanceReportsPage />
          </TabsContent>

          <TabsContent value="members">
            <MembersReportsPage />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentReportPage />
          </TabsContent>

          <TabsContent value="general">
            <GeneralReportsPage />
          </TabsContent>
        </Tabs>

        {/* Reports History Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              היסטוריית דוחות
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportsHistory.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">אין דוחות שנוצרו עדיין</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportsHistory.map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{report.report_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        נוצר ב-{new Date(report.created_at).toLocaleDateString('he-IL')}
                      </p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {report.report_type}
                      </span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      הורד
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
