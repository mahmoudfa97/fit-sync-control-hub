
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { PaymentService } from "@/services/PaymentService";
import { useToast } from "@/hooks/use-toast";
import { CardPaymentMethodForm } from "./CardPaymentMethodForm";
import { PaymentMethodTypeSelector } from "./PaymentMethodTypeSelector";
import { DefaultPaymentSwitch } from "./DefaultPaymentSwitch";
import { FormSubmitButton } from "./FormSubmitButton";

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

  const handlePaymentTypeChange = (type: 'card' | 'bank' | 'other') => {
    form.reset({
      paymentType: type,
      isDefault: form.getValues('isDefault'),
    });
  };

  const onSubmit = async (values: PaymentMethodFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Make sure paymentType is required in the values we pass to the service
      const paymentMethodData: z.infer<typeof paymentMethodSchema> = values;
      
      await PaymentService.addPaymentMethod(paymentMethodData);
      
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
        <PaymentMethodTypeSelector onTypeChange={handlePaymentTypeChange} />

        {paymentType === 'card' && <CardPaymentMethodForm />}

        <DefaultPaymentSwitch />

        <FormSubmitButton 
          isSubmitting={isSubmitting} 
          label="שמור אמצעי תשלום" 
        />
      </form>
    </Form>
  );
}
