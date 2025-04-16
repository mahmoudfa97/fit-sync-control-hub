
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { membershipTypes } from "./MembershipTypes";
import { type Member } from "@/store/slices/membersSlice";
import { MemberService } from "@/services/MemberService";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Banknote, Building, CheckSquare } from "lucide-react";

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  onSubscriptionAdded: () => void;
}

type Duration = '1' | '2' | '3' | '6' | '12';
type PaymentMethod = 'card' | 'cash' | 'bank' | 'check';

export const AddSubscriptionDialog = ({
  open,
  onOpenChange,
  memberId,
  memberName,
  onSubscriptionAdded,
}: AddSubscriptionDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [membershipType, setMembershipType] = useState("רגיל");
  const [duration, setDuration] = useState<Duration>('1');
  const [status, setStatus] = useState<Member['status']>('active');
  const [paymentStatus, setPaymentStatus] = useState<Member['paymentStatus']>('paid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amount, setAmount] = useState<number>(100);
  
  // Payment method specific details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  
  const [checkNumber, setCheckNumber] = useState('');
  const [checkDate, setCheckDate] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  
  const [transferReference, setTransferReference] = useState('');
  
  // Calculate price based on membership type and duration
  const calculatePrice = () => {
    const basePrice = 100; // Base price for one month
    const durationMultiplier = {
      '1': 1,
      '2': 1.9, // 5% discount for 2 months
      '3': 2.8, // ~7% discount for 3 months
      '6': 5.4, // 10% discount for 6 months
      '12': 10.2, // 15% discount for 12 months
    };
    
    // Apply membership type factor (premium types cost more)
    const typeMultiplier = 
      membershipType === 'פרימיום' ? 1.5 : 
      membershipType === 'VIP' ? 2 : 
      1; // regular
    
    return Math.round(basePrice * durationMultiplier[duration] * typeMultiplier);
  };
  
  // Update amount when duration or membership type changes
  React.useEffect(() => {
    setAmount(calculatePrice());
  }, [duration, membershipType]);
  
  // Calculate end date
  const getEndDate = () => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + parseInt(duration));
    return endDate.toLocaleDateString('he-IL');
  };
  
  const handleSubmit = async () => {
    if (!memberId || !membershipType) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare payment details based on method
      let paymentDetails = {};
      
      switch(paymentMethod) {
        case 'card':
          paymentDetails = {
            cardNumber: cardNumber.slice(-4), // Only store last 4 for security
            cardExpiry,
            cardHolderName
          };
          break;
        case 'check':
          paymentDetails = {
            checkNumber,
            checkDate,
            bankName
          };
          break;
        case 'bank':
          paymentDetails = {
            accountNumber: bankAccountNumber,
            bankName,
            branch: bankBranch,
            reference: transferReference
          };
          break;
        // Cash doesn't need extra details
      }
      
      const result = await MemberService.addSubscription(memberId, {
        membershipType,
        status,
        paymentStatus,
        durationMonths: parseInt(duration),
        paymentMethod,
        amount,
        paymentDetails
      });
      
      toast({
        title: "הוסף בהצלחה",
        description: `מנוי חדש נוסף ל${memberName} עד לתאריך ${getEndDate()}`,
      });
      
      onSubscriptionAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding subscription:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת המנוי. נסה שנית.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>הוספת מנוי ל{memberName}</DialogTitle>
          <DialogDescription>
            בחר את סוג המנוי ואת משך הזמן שלו
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="membershipType">סוג המנוי</Label>
            <Select
              value={membershipType}
              onValueChange={setMembershipType}
            >
              <SelectTrigger id="membershipType">
                <SelectValue placeholder="בחר סוג מנוי" />
              </SelectTrigger>
              <SelectContent>
                {membershipTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="duration">משך המנוי</Label>
            <Select
              value={duration}
              onValueChange={(value) => setDuration(value as Duration)}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="בחר תקופה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">חודש (₪{calculatePrice() / parseInt(duration)})</SelectItem>
                <SelectItem value="2">חודשיים (₪{Math.round(calculatePrice() / parseInt(duration))} לחודש)</SelectItem>
                <SelectItem value="3">שלושה חודשים (₪{Math.round(calculatePrice() / parseInt(duration))} לחודש)</SelectItem>
                <SelectItem value="6">חצי שנה (₪{Math.round(calculatePrice() / parseInt(duration))} לחודש)</SelectItem>
                <SelectItem value="12">שנה (₪{Math.round(calculatePrice() / parseInt(duration))} לחודש)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>תאריך התחלה</Label>
              <Input type="text" value={new Date().toLocaleDateString('he-IL')} disabled />
            </div>
            <div>
              <Label>תאריך סיום</Label>
              <Input type="text" value={getEndDate()} disabled />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">סטטוס המנוי</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as Member['status'])}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="בחר סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">פעיל</SelectItem>
                <SelectItem value="inactive">לא פעיל</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="expired">פג תוקף</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paymentStatus">סטטוס תשלום</Label>
            <Select
              value={paymentStatus}
              onValueChange={(value) => setPaymentStatus(value as Member['paymentStatus'])}
            >
              <SelectTrigger id="paymentStatus">
                <SelectValue placeholder="בחר סטטוס תשלום" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">שולם</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="overdue">באיחור</SelectItem>
                <SelectItem value="canceled">בוטל</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">סכום לתשלום</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <div className="border p-3 rounded-md">
            <Label className="mb-2 block font-medium">אמצעי תשלום</Label>
            
            <Tabs defaultValue="cash" value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="cash" className="flex flex-col items-center gap-1 pt-2">
                  <Banknote className="h-4 w-4" />
                  <span>מזומן</span>
                </TabsTrigger>
                <TabsTrigger value="card" className="flex flex-col items-center gap-1 pt-2">
                  <CreditCard className="h-4 w-4" />
                  <span>כרטיס אשראי</span>
                </TabsTrigger>
                <TabsTrigger value="bank" className="flex flex-col items-center gap-1 pt-2">
                  <Building className="h-4 w-4" />
                  <span>העברה בנקאית</span>
                </TabsTrigger>
                <TabsTrigger value="check" className="flex flex-col items-center gap-1 pt-2">
                  <CheckSquare className="h-4 w-4" />
                  <span>המחאה</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="cash">
                <div className="text-gray-500 text-sm">
                  תשלום במזומן יתקבל ישירות בקופת המועדון.
                </div>
              </TabsContent>
              
              <TabsContent value="card">
                <div className="grid gap-2">
                  <Label htmlFor="cardNumber">מספר כרטיס</Label>
                  <Input
                    id="cardNumber"
                    placeholder="**** **** **** ****"
                    maxLength={16}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label htmlFor="cardExpiry">תוקף (MM/YY)</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      placeholder="123"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="cardHolderName">שם בעל הכרטיס</Label>
                  <Input
                    id="cardHolderName"
                    placeholder="Israel Israeli"
                    value={cardHolderName}
                    onChange={(e) => setCardHolderName(e.target.value)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="bank">
                <div className="grid gap-2">
                  <Label htmlFor="bankName">שם הבנק</Label>
                  <Input
                    id="bankName"
                    placeholder="לאומי / פועלים / מזרחי וכו'"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="bankBranch">מספר סניף</Label>
                  <Input
                    id="bankBranch"
                    placeholder="123"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                  />
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="bankAccountNumber">מספר חשבון</Label>
                  <Input
                    id="bankAccountNumber"
                    placeholder="123456789"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                  />
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="transferReference">אסמכתא</Label>
                  <Input
                    id="transferReference"
                    placeholder="מספר אסמכתא להעברה"
                    value={transferReference}
                    onChange={(e) => setTransferReference(e.target.value)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="check">
                <div className="grid gap-2">
                  <Label htmlFor="checkNumber">מספר המחאה</Label>
                  <Input
                    id="checkNumber"
                    placeholder="12345"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                  />
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="checkDate">תאריך המחאה</Label>
                  <Input
                    id="checkDate"
                    type="date"
                    value={checkDate}
                    onChange={(e) => setCheckDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="checkBankName">שם הבנק</Label>
                  <Input
                    id="checkBankName"
                    placeholder="לאומי / פועלים / מזרחי וכו'"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'מוסיף...' : 'הוסף מנוי'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
