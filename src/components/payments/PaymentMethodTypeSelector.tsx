
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

type PaymentMethodType = 'card' | 'bank' | 'other';

interface PaymentMethodTypeSelectorProps {
  onTypeChange: (value: PaymentMethodType) => void;
}

export function PaymentMethodTypeSelector({ onTypeChange }: PaymentMethodTypeSelectorProps) {
  const form = useFormContext();
  
  return (
    <FormField
      control={form.control}
      name="paymentType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>סוג אמצעי תשלום</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              onTypeChange(value as PaymentMethodType);
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
  );
}
