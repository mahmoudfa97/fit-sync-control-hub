
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/utils/translations";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { WhatsAppTemplateForm } from "@/components/notifacations/sms/sms-notifaction";
import { WhatsAppDirectForm } from "@/components/notifacations/sms/WhatsAppDirectForm";
import { WhatsAppBotForm } from "@/components/notifacations/sms/WhatsappBot";
import { WhatsAppNotification } from "@/components/notifacations/sms/whatsapp-notification";
import { WhatsAppSmartForm } from "@/components/notifacations/sms/WhatsAppSmartForm";
import { WhatsAppSettings } from "@/components/whatsapp/WhatsAppSettings";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import WhatsAppMessaging from "@/components/whatsapp/WhatsAppMessaging";
import { useOrganization } from "@/contexts/OrganizationContext";

export default function MessagesCenter() {
  const { currentOrganization, loading } = useOrganization();

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading organization...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!currentOrganization) {
    return (
      <DashboardShell>
        <Card>
          <CardHeader>
            <CardTitle>No Organization Selected</CardTitle>
            <CardDescription>Please select or create an organization to access messaging features.</CardDescription>
          </CardHeader>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{t("messages_center")}</h1>
            <p className="text-muted-foreground">{t("messages_center_desc")}</p>
          </div>
          <div className="w-64">
            <SubscriptionStatus />
          </div>
        </div>

        <Tabs defaultValue="messaging" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="messaging" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>WhatsApp Messaging</CardTitle>
                  <CardDescription>Send messages and manage conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  <WhatsAppMessaging />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Direct Messages</CardTitle>
                  <CardDescription>Send direct WhatsApp messages</CardDescription>
                </CardHeader>
                <CardContent>
                  <WhatsAppDirectForm />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Messages</CardTitle>
                  <CardDescription>AI-powered message suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                  <WhatsAppSmartForm />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bot Messages</CardTitle>
                  <CardDescription>Automated message responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <WhatsAppBotForm />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Message Templates</CardTitle>
                  <CardDescription>Manage and send WhatsApp template messages</CardDescription>
                </CardHeader>
                <CardContent>
                  <WhatsAppTemplateForm />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Automated notification system</CardDescription>
                </CardHeader>
                <CardContent>
                  <WhatsAppNotification />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <WhatsAppSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
