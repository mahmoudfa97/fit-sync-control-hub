
import { useState } from "react";
import { 
  CreditCard,
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search,
  Calendar,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Badge
} from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addPayment, filterPaymentsByMember, filterPaymentsByStatus } from "@/store/slices/paymentsSlice";
import { paymentStatusStyles, paymentStatusLabels } from "@/components/members/StatusBadges";

const paymentMethodIcons = {
  card: <CreditCard className="h-4 w-4" />,
  cash: <Wallet className="h-4 w-4" />,
  bank: <CreditCard className="h-4 w-4" />,
  other: <CreditCard className="h-4 w-4" />,
};

const paymentMethodLabels = {
  card: "بطاقة ائتمان",
  cash: "نقدي",
  bank: "تحويل بنكي",
  other: "أخرى",
};

export default function Payments() {
  const dispatch = useAppDispatch();
  const { payments, filteredPayments } = useAppSelector(state => state.payments);
  const { members } = useAppSelector(state => state.members);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    memberId: "",
    amount: "",
    paymentMethod: "cash" as "card" | "cash" | "bank" | "other",
    status: "paid" as "paid" | "pending" | "overdue" | "canceled",
    description: "",
  });
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      dispatch(filterPaymentsByMember(term));
    } else {
      dispatch(filterPaymentsByStatus(null));
    }
  };
  
  const handleFilterChange = (status: string | null) => {
    dispatch(filterPaymentsByStatus(status));
  };
  
  const handleAddPayment = () => {
    if (!newPayment.memberId || !newPayment.amount || isNaN(Number(newPayment.amount))) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال عضو ومبلغ صالح",
        variant: "destructive",
      });
      return;
    }
    
    const member = members.find(m => m.id === newPayment.memberId);
    
    if (!member) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على العضو",
        variant: "destructive",
      });
      return;
    }
    
    const today = new Date();
    const paymentDateStr = `${today.getDate()} ${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][today.getMonth()]}، ${today.getFullYear()}`;
    
    dispatch(
      addPayment({
        id: `payment-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        memberInitials: member.initials,
        amount: Number(newPayment.amount),
        currency: 'ريال',
        paymentMethod: newPayment.paymentMethod,
        paymentDate: paymentDateStr,
        status: newPayment.status,
        description: newPayment.description || 'رسوم اشتراك',
        receiptNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString(), // For backward compatibility
        type: 'membership', // For backward compatibility
        method: newPayment.paymentMethod === 'card' ? 'credit' : newPayment.paymentMethod, // For backward compatibility
        invoiceNumber: `INV-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` // For backward compatibility
      })
    );
    
    toast({
      title: "تم إضافة الدفعة بنجاح",
      description: `تمت إضافة دفعة بقيمة ${newPayment.amount} ريال لـ ${member.name}`,
    });
    
    setNewPayment({
      memberId: "",
      amount: "",
      paymentMethod: "cash",
      status: "paid",
      description: "",
    });
    
    setAddPaymentOpen(false);
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المدفوعات</h1>
          <p className="text-muted-foreground">
            إدارة ومتابعة مدفوعات الأعضاء في صالتك الرياضية.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="البحث في المدفوعات..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">فلترة</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleFilterChange(null)}>
                  جميع المدفوعات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("paid")}>
                  المدفوعات المكتملة
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("pending")}>
                  المدفوعات المعلقة
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("overdue")}>
                  المدفوعات المتأخرة
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setAddPaymentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة دفعة
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>سجل المدفوعات</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
              <span className="sr-only">تنزيل CSV</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">العضو</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-right">رقم الإيصال</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{payment.memberInitials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{payment.memberName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {payment.amount} {payment.currency}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {paymentMethodIcons[payment.paymentMethod]}
                        <span>{paymentMethodLabels[payment.paymentMethod]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.paymentDate}
                    </TableCell>
                    <TableCell>
                      {payment.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={paymentStatusStyles[payment.status]}>
                        {paymentStatusLabels[payment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {payment.receiptNumber}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    لم يتم العثور على مدفوعات.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Payment Dialog */}
      <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة دفعة جديدة</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل المدفوعات أدناه.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="member">العضو</Label>
              <Select
                value={newPayment.memberId}
                onValueChange={(value) => setNewPayment({...newPayment, memberId: value})}
              >
                <SelectTrigger id="member">
                  <SelectValue placeholder="اختر العضو" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">المبلغ (ريال)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <Select
                value={newPayment.paymentMethod}
                onValueChange={(value: "card" | "cash" | "bank" | "other") => 
                  setNewPayment({...newPayment, paymentMethod: value})
                }
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="card">بطاقة ائتمان</SelectItem>
                  <SelectItem value="bank">تحويل بنكي</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={newPayment.status}
                onValueChange={(value: "paid" | "pending" | "overdue" | "canceled") => 
                  setNewPayment({...newPayment, status: value})
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="overdue">متأخر</SelectItem>
                  <SelectItem value="canceled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">الوصف</Label>
              <Input
                id="description"
                placeholder="رسوم اشتراك، تجديد، إلخ."
                value={newPayment.description}
                onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPaymentOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddPayment}>
              إضافة دفعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
