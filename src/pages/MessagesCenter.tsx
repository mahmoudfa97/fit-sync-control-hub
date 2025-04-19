
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { t } from "@/utils/translations";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { WhatsAppTemplateForm } from "@/components/notifacations/sms/sms-notifaction";

export default function MessagesCenter() {
  return (
    <DashboardShell>
      <Card>
        <CardHeader>
          <CardTitle>{t("messages_center")}</CardTitle>
          <CardDescription>{t("messages_center_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <WhatsAppTemplateForm />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
