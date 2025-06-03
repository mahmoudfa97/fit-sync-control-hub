
import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, Search, Eye, Download, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoice_number: string;
  member_name: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  due_date: string;
  created_at: string;
}

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API call
      const mockInvoices: Invoice[] = [
        {
          id: "1",
          invoice_number: "INV-001",
          member_name: "יוסי כהן",
          amount: 199.90,
          status: "paid",
          due_date: "2024-01-15",
          created_at: "2024-01-01"
        },
        {
          id: "2", 
          invoice_number: "INV-002",
          member_name: "שרה לוי",
          amount: 299.90,
          status: "pending",
          due_date: "2024-01-20",
          created_at: "2024-01-05"
        }
      ];
      
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('שגיאה בטעינת החשבוניות');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInvoice = async (memberId?: string, amount?: number, description?: string, dueDate?: string) => {
    try {
      // Mock implementation - replace with actual API call
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        invoice_number: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
        member_name: "חבר חדש",
        amount: amount || 199.90,
        status: "pending",
        due_date: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_at: new Date().toISOString().split('T')[0]
      };
      
      setInvoices(prev => [newInvoice, ...prev]);
      toast.success('חשבונית נוצרה בהצלחה');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('שגיאה ביצירת החשבונית');
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      // Mock implementation - replace with actual PDF generation
      toast.success('החשבונית הורדה בהצלחה');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('שגיאה בהורדת החשבונית');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid": return "שולם";
      case "pending": return "ממתין";
      case "overdue": return "באיחור";
      default: return status;
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">חשבוניות</h1>
            <p className="text-muted-foreground">נהל חשבוניות ותשלומים</p>
          </div>
          <Button onClick={() => generateInvoice()}>
            <Plus className="h-4 w-4 mr-2" />
            צור חשבונית חדשה
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              רשימת חשבוניות
            </CardTitle>
            <CardDescription>
              כאן תוכל לראות ולנהל את כל החשבוניות במערכת
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="חפש לפי שם חבר או מספר חשבונית..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="סנן לפי סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="paid">שולם</SelectItem>
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="overdue">באיחור</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>מספר חשבונית</TableHead>
                  <TableHead>שם חבר</TableHead>
                  <TableHead>סכום</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>תאריך יעד</TableHead>
                  <TableHead>תאריך יצירה</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      טוען...
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      לא נמצאו חשבוניות
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.member_name}</TableCell>
                      <TableCell>{invoice.amount.toFixed(2)} ₪</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusText(invoice.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString('he-IL')}</TableCell>
                      <TableCell>{new Date(invoice.created_at).toLocaleDateString('he-IL')}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => downloadInvoice(invoice.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
