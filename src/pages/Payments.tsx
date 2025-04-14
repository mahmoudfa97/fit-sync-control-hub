import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  CreditCard,
  Banknote,
  Building,
  Plus,
  Filter,
  XCircle,
  Search,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useToast } from "@/hooks/use-toast";
import { filterPaymentsByMember, filterPaymentsByStatus } from "@/store/slices/paymentsSlice";
import AddPaymentForm from "@/components/payments/AddPaymentForm";
import AddPaymentMethodForm from "@/components/payments/AddPaymentMethodForm";
import { MemberService } from "@/services/MemberService";
import { PaymentService, PaymentMethod } from "@/services/PaymentService";
import { useAuth } from "@/contexts/AuthContext";
import { Member } from "@/store/slices/membersSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Payments() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { session } = useAuth();
  const { toast } = useToast();
  const { filteredPayments } = useAppSelector((state) => state.payments);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session && !isLoading) {
      navigate("/auth");
    }
  }, [session, navigate, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const membersData = await MemberService.fetchMembers();
        setMembers(membersData);

        if (session) {
          const paymentMethodsData = await PaymentService.getPaymentMethods();
          setPaymentMethods(paymentMethodsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "שגיאה בטעינת נתונים",
          description: "לא ניתן לטעון את הנתונים הדרושים",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, toast]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    dispatch(filterPaymentsByMember(term));
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    dispatch(filterPaymentsByStatus(status));
  };

  const refreshPaymentMethods = async () => {
    try {
      const paymentMethodsData = await PaymentService.getPaymentMethods();
      setPaymentMethods(paymentMethodsData);
    } catch (error) {
      console.error("Error refreshing payment methods:", error);
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">ניהול תשלומים</h1>
            <p className="text-muted-foreground">
              נהל תשלומים וצפה בהיסטוריית תשלומים
            </p>
          </div>
          <Button
            onClick={() => setIsAddPaymentOpen(true)}
            disabled={!session}
          >
            <Plus className="h-4 w-4 mr-2" /> תשלום חדש
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>אפשרויות</CardTitle>
                <CardDescription>סנן וחפש תשלומים</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="font-medium text-sm">חיפוש</label>
                  <div className="relative">
                    <Input
                      placeholder="חפש לפי שם לקוח..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-medium text-sm">סנן לפי סטטוס</label>
                  <Select
                    value={statusFilter || ""}
                    onValueChange={(value) => handleStatusFilter(value || null)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="כל הסטטוסים" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">כל הסטטוסים</SelectItem>
                      <SelectItem value="paid">שולם</SelectItem>
                      <SelectItem value="pending">ממתין</SelectItem>
                      <SelectItem value="overdue">באיחור</SelectItem>
                      <SelectItem value="canceled">בוטל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchTerm || statusFilter) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter(null);
                      handleSearch("");
                      handleStatusFilter(null);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> נקה מסננים
                  </Button>
                )}

                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsAddPaymentMethodOpen(true)}
                    disabled={!session}
                  >
                    <CreditCard className="h-4 w-4 mr-2" /> הוסף אמצעי תשלום
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>היסטוריית תשלומים</CardTitle>
                <CardDescription>
                  סה"כ {filteredPayments.length} תשלומים
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPayments.length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-muted-foreground">לא נמצאו תשלומים</p>
                    </div>
                  ) : (
                    filteredPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between"
                      >
                        <div className="flex items-center mb-2 md:mb-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            {payment.paymentMethod === "card" ? (
                              <CreditCard className="h-5 w-5 text-primary" />
                            ) : payment.paymentMethod === "cash" ? (
                              <Banknote className="h-5 w-5 text-primary" />
                            ) : (
                              <Building className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{payment.memberName}</div>
                            <div className="text-sm text-muted-foreground">
                              {payment.paymentDate}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end mt-2 md:mt-0">
                          <div className="text-lg font-bold">
                            {payment.currency} {payment.amount}
                          </div>
                          <div className="text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : payment.status === "overdue"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {payment.status === "paid"
                                ? "שולם"
                                : payment.status === "pending"
                                ? "ממתין"
                                : payment.status === "overdue"
                                ? "באיחור"
                                : "בוטל"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הוסף תשלום חדש</DialogTitle>
            <DialogDescription>
              הזן את פרטי התשלום החדש
            </DialogDescription>
          </DialogHeader>
          <AddPaymentForm
            members={members}
            paymentMethods={paymentMethods}
            onPaymentAdded={() => setIsAddPaymentOpen(false)}
            onAddPaymentMethod={() => {
              setIsAddPaymentOpen(false);
              setTimeout(() => setIsAddPaymentMethodOpen(true), 100);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddPaymentMethodOpen}
        onOpenChange={setIsAddPaymentMethodOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הוסף אמצעי תשלום</DialogTitle>
            <DialogDescription>
              הזן את פרטי אמצעי התשלום החדש
            </DialogDescription>
          </DialogHeader>
          <AddPaymentMethodForm
            onSuccess={() => {
              refreshPaymentMethods();
              setIsAddPaymentMethodOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
