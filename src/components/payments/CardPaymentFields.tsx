
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";

export function CardPaymentFields() {
  const form = useFormContext();

  return (
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
  );
}
