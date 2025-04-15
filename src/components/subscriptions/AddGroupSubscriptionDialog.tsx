
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { t } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScheduleSelector } from "./ScheduleSelector";

const schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  door: z.string(),
  price_per_month: z.number().min(0),
  price_two_months: z.number().min(0),
  price_three_months: z.number().min(0),
  price_four_months: z.number().min(0),
  price_six_months: z.number().min(0),
  annual_price: z.number().min(0),
  schedule: z.array(z.object({
    day: z.string(),
    start: z.number(),
    end: z.number(),
  })).optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddGroupSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionAdded?: () => void;
}

export function AddGroupSubscriptionDialog({ 
  open, 
  onOpenChange,
  onSubscriptionAdded 
}: AddGroupSubscriptionDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      door: "main",
      price_per_month: 0,
      price_two_months: 0,
      price_three_months: 0,
      price_four_months: 0,
      price_six_months: 0,
      annual_price: 0,
      schedule: [],
    }
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('group_subscriptions')
        .insert([{
          name: values.name,
          price_per_month: values.price_per_month,
          price_two_months: values.price_two_months,
          price_three_months: values.price_three_months,
          price_four_months: values.price_four_months,
          price_six_months: values.price_six_months,
          annual_price: values.annual_price,
          is_active: true,
          schedule: values.schedule
        }]);

      if (error) throw error;

      toast.success(t("subscriptionAdded"));
      onOpenChange(false);
      if (onSubscriptionAdded) onSubscriptionAdded();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("createSubscription")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("subscriptionName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="door"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doors</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select door" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="main">Main-ראשי</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price_per_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("pricePerMonth")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_two_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("twoMonths")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_three_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("threeMonths")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price_four_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fourMonths")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_six_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("sixMonths")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annual_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("annualPrice")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <ScheduleSelector form={form} />

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {t("add")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
