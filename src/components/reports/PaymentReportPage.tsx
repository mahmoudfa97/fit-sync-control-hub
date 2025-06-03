
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, Filter, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";

interface PaymentReport {
  id: string;
  member_name: string;
  member_last_name: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
}

export function PaymentReportPage() {
  const { currentOrganization } = useOrganization();
  const [payments, setPayments] = useState<PaymentReport[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (currentOrganization) {
      fetchPayments();
    }
  }, [currentOrganization]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, paymentMethodFilter, startDate, endDate]);

  const fetchPayments = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("payments")
        .select(`
          id,
          amount,
          payment_date,
          payment_method,
          status,
          custom_members!inner(
            name,
            last_name
          )
        `)
        .eq("organization_id", currentOrganization.id)
        .order("payment_date", { ascending: false });

      if (error) throw error;

      const formattedPayments: PaymentReport[] = (data || []).map((payment: any) => ({
        id: payment.id,
        member_name: payment.custom_members?.name || 'לא ידוע',
        member_last_name: payment.custom_members?.last_name || '',
        amount: payment.amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        status: payment.status,
      }));

      setPayments(formattedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("שגיאה בטעינת דוח התשלומים");
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.member_last_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Payment method filter
    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter(payment => payment.payment_method === paymentMethodFilter);
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(payment => 
        new Date(payment.payment_date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(payment => 
        new Date(payment.payment_date) <= new Date(endDate)
      );
    }

    setFilteredPayments(filtered);
  };

  const exportToCSV = () => {
    const headers = ["שם חבר", "סכום", "תאריך תשלום", "אמצעי תשלום", "סטטוס"];
    const csvData = [
      headers.join(","),
      ...filteredPayments.map(payment => [
        `"${payment.member_name} ${payment.member_last_name}"`,
        payment.amount,
        new Date(payment.payment_date).toLocaleDateString('he-IL'),
        payment.payment_method,
        payment.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payment-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTotalAmount = () => {
    return filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "שולם";
      case "pending":
        return "ממתין";
      case "failed":
        return "נכשל";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            מסננים
          </CardTitle>
          <CardDescription>
            סנן את דוח התשלומים לפי קריטריונים שונים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">חיפוש</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="חפש לפי שם חבר..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="paid">שולם</SelectItem>
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="failed">נכשל</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">אמצעי תשלום</Label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="בחר אמצעי תשלום" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל האמצעים</SelectItem>
                  <SelectItem value="מזומן">מזומן</SelectItem>
                  <SelectItem value="אשראי">אשראי</SelectItem>
                  <SelectItem value="העברה בנקאית">העברה בנקאית</SelectItem>
                  <SelectItem value="ביט">ביט</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-range">טווח תאריכים</Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              סה"כ {filteredPayments.length} תשלומים | סכום כולל: {getTotalAmount().toFixed(2)} ₪
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              ייצא ל-CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>דוח תשלומים</CardTitle>
          <CardDescription>
            רשימת כל התשלומים במערכת
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם חבר</TableHead>
                <TableHead>סכום</TableHead>
                <TableHead>תאריך תשלום</TableHead>
                <TableHead>אמצעי תשלום</TableHead>
                <TableHead>סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    טוען...
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    לא נמצאו תשלומים
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.member_name} {payment.member_last_name}
                    </TableCell>
                    <TableCell>{payment.amount.toFixed(2)} ₪</TableCell>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString('he-IL')}
                    </TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(payment.status)}>
                        {getStatusText(payment.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
