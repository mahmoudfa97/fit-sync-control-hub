
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Banknote, Bank, Plus } from "lucide-react";
import { Member } from "@/store/slices/membersSlice";
import { PaymentService, PaymentMethod } from "@/services/PaymentService";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/hooks/redux";
import { addPayment } from "@/store/slices/paymentsSlice";

const paymentSchema = z.object({
  memberId: z.string({
    required_error: "יש לבחור לקוח",
  }),
  amount: z.string().min(1, { message: "יש להזין סכום" }).transform(Number),
  paymentMethod: z.string({
    required_error: "יש לבחור אמצעי תשלום",
  }),
  description: z.string().optional(),
});

interface AddPaymentFormProps {
  members: Member[];
  paymentMethods: PaymentMethod[];
  onPaymentAdded?: () => void;
  onAddPaymentMethod?: () => void;
}

export default function AddPaymentForm({
  members,
  paymentMethods,
  onPaymentAdded,
  onAddPaymentMethod
}: AddPaymentFormProps) {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      memberId: "",
      amount: "",
      paymentMethod: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof paymentSchema>) => {
    try {
      setIsSubmitting(true);
      
      const newPayment = await PaymentService.processPayment(
        values.memberId,
        values.amount,
        values.paymentMethod,
        values.description
      );
      
      dispatch(addPayment(newPayment));
      
      toast({
        title: "תשלום נוסף בהצלחה",
        description: `קבלה מספר ${newPayment.receiptNumber} נוצרה`,
      });
      
      form.reset();
      
      if (onPaymentAdded) {
        onPaymentAdded();
      }
    } catch (error: any) {
      toast({
        title: "שגיאה בהוספת תשלום",
        description: error.message || "אירעה שגיאה בעיבוד התשלום, אנא נסה שנית",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>תשלום חדש</CardTitle>
        <CardDescription>הוסף תשלום חדש למערכת</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>בחר לקוח</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר לקוח" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} {member.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סכום</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="100" 
                        {...field} 
                        className="ltr:pr-8 rtl:pl-8"
                      />
                      <div className="absolute inset-y-0 rtl:right-3 ltr:left-3 flex items-center pointer-events-none">
                        ₪
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex justify-between items-center">
                      <span>אמצעי תשלום</span>
                      {onAddPaymentMethod && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={onAddPaymentMethod}
                          className="h-8 px-2"
                        >
                          <Plus className="h-4 w-4 mr-1" /> הוסף אמצעי תשלום
                        </Button>
                      )}
                    </div>
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר אמצעי תשלום" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center">
                          <Banknote className="mr-2 h-4 w-4" />
                          <span>מזומן</span>
                        </div>
                      </SelectItem>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          <div className="flex items-center">
                            {method.paymentType === 'card' ? (
                              <CreditCard className="mr-2 h-4 w-4" />
                            ) : method.paymentType === 'bank' ? (
                              <Bank className="mr-2 h-4 w-4" />
                            ) : (
                              <Banknote className="mr-2 h-4 w-4" />
                            )}
                            <span>
                              {method.paymentType === 'card' 
                                ? `${method.provider} (${method.lastFour})` 
                                : method.paymentType === 'bank' 
                                  ? 'העברה בנקאית' 
                                  : 'אחר'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור (אופציונלי)</FormLabel>
                  <FormControl>
                    <Input placeholder="תשלום עבור..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  מעבד תשלום...
                </>
              ) : (
                "בצע תשלום"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
