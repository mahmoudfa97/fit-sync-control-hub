import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/utils/translations";
import { Loader2, Plus, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AddGroupSubscriptionDialog } from "@/components/subscriptions/AddGroupSubscriptionDialog";

interface GroupSubscription {
  id: string;
  name: string;
  price_per_month: number;
  price_two_months: number;
  price_three_months: number;
  price_four_months: number;
  price_six_months: number;
  annual_price: number;
  is_active: boolean;
}

export default function GroupSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<GroupSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('group_subscriptions')
        .select('*');

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error(t("errorFetchingData"));
    } finally {
      setLoading(false);
    }
  };

  const renderSubscriptionsTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("subscriptionName")}</TableHead>
            <TableHead>{t("pricePerMonth")}</TableHead>
            <TableHead>{t("twoMonths")}</TableHead>
            <TableHead>{t("threeMonths")}</TableHead>
            <TableHead>{t("fourMonths")}</TableHead>
            <TableHead>{t("sixMonths")}</TableHead>
            <TableHead>{t("annualPrice")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell>{subscription.name}</TableCell>
              <TableCell>{subscription.price_per_month}</TableCell>
              <TableCell>{subscription.price_two_months}</TableCell>
              <TableCell>{subscription.price_three_months}</TableCell>
              <TableCell>{subscription.price_four_months}</TableCell>
              <TableCell>{subscription.price_six_months}</TableCell>
              <TableCell>{subscription.annual_price}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button size="icon" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <DashboardShell>
      <Card>
        <CardHeader>
          <CardTitle>{t("groupSubscriptions")}</CardTitle>
          <CardDescription>{t("groupSubscriptionsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("createSubscription")}
            </Button>
          </div>
          {renderSubscriptionsTable()}
        </CardContent>
      </Card>

      <AddGroupSubscriptionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSubscriptionAdded={fetchSubscriptions}
      />
    </DashboardShell>
  );
}
