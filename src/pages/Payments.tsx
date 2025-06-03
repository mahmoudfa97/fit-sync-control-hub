
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Plus, CreditCard, Calendar, DollarSign } from "lucide-react";
import { PaymentService } from "@/services/PaymentService";
import { MemberService } from "@/services/MemberService";
import { convertServiceMembersToStoreMembers } from "@/utils/memberConverter";
import { Member } from "@/store/slices/members/types";

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  payment_date: string;
  member_id: string;
  description?: string;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, membersData] = await Promise.all([
        PaymentService.fetchPayments(),
        MemberService.fetchMembers()
      ]);
      
      setPayments(paymentsData);
      const storeMembers = convertServiceMembersToStoreMembers(membersData);
      setMembers(storeMembers);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : "לא ידוע";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: "שולם", variant: "default" as const },
      pending: { label: "ממתין", variant: "secondary" as const },
      failed: { label: "נכשל", variant: "destructive" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">טוען תשלומים...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">תשלומים</h1>
            <p className="text-muted-foreground">נהל תשלומים וחיובים</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            הוסף תשלום
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה"כ תשלומים החודש</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₪{payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">תשלומים שולמו</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments.filter(p => p.status === 'paid').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">תשלומים ממתינים</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments.filter(p => p.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>רשימת תשלומים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">אין תשלומים להצגה</p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{getMemberName(payment.member_id)}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.description || "תשלום מנוי"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">₪{payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.payment_date).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">{payment.payment_method}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
