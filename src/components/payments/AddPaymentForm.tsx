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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PaymentMethod, PaymentService } from "@/services/PaymentService";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Member } from "@/store/slices/members";

const cardPaymentMethodSchema = z.object({
  paymentType: z.literal('card'),
  provider: z.enum(['visa', 'mastercard', 'other'], {
    required_error: "יש לבחור ספק כרטיס אשראי",
  }),
  lastFour: z.string().length(4, { message: "יש להזין 4 ספרות אחרונות" }),
  cardHolderName: z.string().min(2, { message: "יש להזין שם בעל הכרטיס" }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, { message: "פורמט לא תקין (MM/YY)" }),
  isDefault: z.boolean().default(false),
});

const otherPaymentMethodSchema = z.object({
  paymentType: z.enum(['bank', 'other']),
  isDefault: z.boolean().default(false),
});

const paymentMethodSchema = z.discriminatedUnion('paymentType', [
  cardPaymentMethodSchema,
  otherPaymentMethodSchema,
]);

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

interface AddPaymentMethodFormProps {
  onSuccess?: () => void;
  members: Member[];
  paymentMethods: PaymentMethod[];
  onPaymentAdded: () => void;
  onAddPaymentMethod: () => void;
}

export default function AddPaymentMethodForm({ onSuccess }: AddPaymentMethodFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      paymentType: 'card',
      isDefault: false,
    },
  });

  const paymentType = form.watch('paymentType');

  const onSubmit = async (values: PaymentMethodFormValues) => {
    try {
      setIsSubmitting(true);
      
      await PaymentService.addPaymentMethod(values);
      
      toast({
        title: "אמצעי תשלום נוסף בהצלחה",
        description: "אמצעי התשלום זמין כעת לשימוש",
      });
      
      form.reset({
        paymentType: 'card',
        isDefault: false,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "שגיאה בהוספת אמצעי תשלום",
        description: error.message || "אירעה שגיאה, אנא נסה שנית",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="paymentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>סוג אמצעי תשלום</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  form.reset({
                    paymentType: value as 'card' | 'bank' | 'other',
                    isDefault: form.getValues('isDefault'),
                  });
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג אמצעי תשלום" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="card">כרטיס אשראי</SelectItem>
                  <SelectItem value="bank">העברה בנקאית</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {paymentType === 'card' && (
          <>
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סוג כרטיס</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר סוג כרטיס" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="other">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastFour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>4 ספרות אחרונות של הכרטיס</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1234" 
                      maxLength={4}
                      {...field} 
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardHolderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שם בעל הכרטיס</FormLabel>
                  <FormControl>
                    <Input placeholder="ישראל ישראלי" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תוקף</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="MM/YY" 
                      {...field} 
                      onChange={e => {
                        const value = e.target.value.replace(/[^\d/]/g, '');
                        let formatted = value;
                        if (value.length === 2 && !value.includes('/') && field.value.length !== 3) {
                          formatted = value + '/';
                        }
                        field.onChange(formatted.slice(0, 5));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-x-2 space-x-reverse">
              <FormLabel>הגדר כאמצעי תשלום ברירת מחדל</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
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
              שומר...
            </>
          ) : (
            "שמור אמצעי תשלום"
          )}
        </Button>
      </form>
    </Form>
  );
}
