
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useFormContext } from "react-hook-form";

export function DefaultPaymentSwitch() {
  const form = useFormContext();
  
  return (
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
  );
}
