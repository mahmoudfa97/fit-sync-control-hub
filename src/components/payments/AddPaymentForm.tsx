
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { PaymentService } from "@/services/PaymentService";
import { useToast } from "@/hooks/use-toast";
import { Member } from "@/store/slices/members";
import { CardPaymentFields } from "./CardPaymentFields";
import { PaymentMethodTypeSelector } from "./PaymentMethodTypeSelector";
import { DefaultPaymentSwitch } from "./DefaultPaymentSwitch";
import { FormSubmitButton } from "./FormSubmitButton";
import { PaymentMethodFormValues, paymentMethodSchema } from "./schemas/paymentMethodSchemas";
import { PaymentMethod } from "@/services/PaymentService";

interface AddPaymentFormProps {
  onSuccess?: () => void;
  members: Member[];
  paymentMethods: PaymentMethod[];
  onPaymentAdded: () => void;
  onAddPaymentMethod: () => void;
}

export default function AddPaymentForm({ members, paymentMethods, onPaymentAdded, onAddPaymentMethod }: AddPaymentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      paymentType: 'card' as const,
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
      await PaymentService.addPaymentMethod(values as any); // Type assertion needed due to PaymentService interface
      
      toast({
        title: "אמצעי תשלום נוסף בהצלחה",
        description: "אמצעי התשלום זמין כעת לשימוש",
      });
      
      form.reset({
        paymentType: 'card' as const,
        isDefault: false,
      });
      
      if (onPaymentAdded) {
        onPaymentAdded();
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
        {paymentType === 'card' && <CardPaymentFields />}
        <DefaultPaymentSwitch />
        <FormSubmitButton 
          isSubmitting={isSubmitting} 
          label="שמור אמצעי תשלום" 
        />
      </form>
    </Form>
  );
}
