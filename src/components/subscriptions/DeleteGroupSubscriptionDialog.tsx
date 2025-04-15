
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { t } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteGroupSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionDeleted?: () => void;
  subscriptionId: string | null;
  subscriptionName: string | null;
}

export function DeleteGroupSubscriptionDialog({
  open,
  onOpenChange,
  onSubscriptionDeleted,
  subscriptionId,
  subscriptionName
}: DeleteGroupSubscriptionDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!subscriptionId) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('group_subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) throw error;

      toast.success(t("subscriptionDeleted"));
      onOpenChange(false);
      if (onSubscriptionDeleted) onSubscriptionDeleted();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("deleteSubscription")}</DialogTitle>
          <DialogDescription>
            {t("deleteSubscriptionConfirmation")} "{subscriptionName}"?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
