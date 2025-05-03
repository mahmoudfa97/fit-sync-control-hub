
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { t } from "@/utils/translations";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { WhatsAppTemplateForm } from "@/components/notifacations/sms/sms-notifaction";
import { WhatsAppDirectForm } from "@/components/notifacations/sms/WhatsAppDirectForm";
import { WhatsAppBotForm } from "@/components/notifacations/sms/WhatsappBot";
import { WhatsAppNotification } from "@/components/notifacations/sms/whatsapp-notification";
import { WhatsAppSmartForm } from "@/components/notifacations/sms/WhatsAppSmartForm";
import WhatsAppMessaging from "@/components/whatsapp/WhatsAppMessaging";

export default function MessagesCenter() {
  return (
    <DashboardShell>
      <Card>
        <CardHeader>
          <CardTitle>{t("messages_center")}</CardTitle>
          <CardDescription>{t("messages_center_desc")}</CardDescription>
        </CardHeader>
        <CardContent>

          <div className="container mx-auto flex flex-wrap gap-4">
           <WhatsAppMessaging />

      </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
