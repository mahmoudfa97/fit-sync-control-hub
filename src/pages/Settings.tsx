
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Send } from "lucide-react";
import { t } from "@/utils/translations";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateSettings, updateNotifications } from "@/store/slices/settingsSlice";

export default function Settings() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const [smsSettings, setSmsSettings] = useState({
    provider: "twilio",
    apiKey: "",
    apiSecret: "",
    fromNumber: "",
    testMessage: ""
  });

  const handleInputChange = (field, value) => {
    dispatch(updateSettings({ [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    dispatch(updateSettings({
      [parent]: {
        ...settings[parent],
        [field]: value,
      }
    }));
  };

  const handleSmsChange = (field, value) => {
    setSmsSettings({
      ...smsSettings,
      [field]: value
    });
  };

  const saveSettings = () => {
    // Save settings logic would go here
    toast.success(t("smsConfigSuccess"));
  };

  const sendTestMessage = () => {
    // Logic to send test SMS would go here
    if (smsSettings.apiKey && smsSettings.fromNumber) {
      toast.success(t("smsTestSuccess"));
    } else {
      toast.error(t("smsTestFail"));
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("settings")}</h1>
          <p className="text-muted-foreground">
            {t("settingsDesc")}
          </p>
        </div>
        <Button onClick={saveSettings}>{t("saveSettings")}</Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="general">{t("general")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("notifications")}</TabsTrigger>
          <TabsTrigger value="business">{t("businessInfo")}</TabsTrigger>
          <TabsTrigger value="privacy">{t("privacyAndSecurity")}</TabsTrigger>
          <TabsTrigger value="system">{t("system")}</TabsTrigger>
          <TabsTrigger value="sms">{t("smsProvider")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("basicInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gymName">{t("gymName")}</Label>
                  <Input
                    id="gymName"
                    value={settings.gymName}
                    onChange={(e) => handleInputChange("gymName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">{t("language")}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {settings.language === "ar" ? "עברית" : "English"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleInputChange("language", "he")}>
                          עברית
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange("language", "en")}>
                          English
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="address">{t("address")}</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("workingHours")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weekdays">{t("weekdays")}</Label>
                  <Input
                    id="weekdays"
                    value={settings.workingHours.weekdays}
                    onChange={(e) => handleNestedChange("workingHours", "weekdays", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekends">{t("weekends")}</Label>
                  <Input
                    id="weekends"
                    value={settings.workingHours.weekends}
                    onChange={(e) => handleNestedChange("workingHours", "weekends", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("notificationSettings")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("emailNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("receiveEmailNotifications")}
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(value) => handleNestedChange("notifications", "email", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("smsNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("receiveSmsNotifications")}
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={(value) => handleNestedChange("notifications", "sms", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("appNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("receiveAppNotifications")}
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.app}
                  onCheckedChange={(value) => handleNestedChange("notifications", "app", value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("membershipReminders")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("expiryReminders")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("sendRemindersBeforeExpiry")}
                  </p>
                </div>
                <Switch
                  checked={settings.memberReminders}
                  onCheckedChange={(value) => handleInputChange("memberReminders", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("autoRenewals")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("renewMembershipsAutomatically")}
                  </p>
                </div>
                <Switch
                  checked={settings.autoRenewals}
                  onCheckedChange={(value) => handleInputChange("autoRenewals", value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("businessInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">{t("taxNumber")}</Label>
                  <Input
                    id="taxNumber"
                    value={settings.businessInfo.taxNumber}
                    onChange={(e) => handleNestedChange("businessInfo", "taxNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commercialRegister">{t("commercialRegister")}</Label>
                  <Input
                    id="commercialRegister"
                    value={settings.businessInfo.commercialRegister}
                    onChange={(e) => handleNestedChange("businessInfo", "commercialRegister", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">{t("taxRate")}</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => handleInputChange("taxRate", parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("privacyAndSecurity")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("dataSharing")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("shareDataWithPartners")}
                  </p>
                </div>
                <Switch
                  checked={settings.privacySettings.shareData}
                  onCheckedChange={(value) => handleNestedChange("privacySettings", "shareData", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("memberVisibility")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("membersCanSeeOthers")}
                  </p>
                </div>
                <Switch
                  checked={settings.privacySettings.membersCanSeeOthers}
                  onCheckedChange={(value) => handleNestedChange("privacySettings", "membersCanSeeOthers", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("publicProfile")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("makeGymProfilePublic")}
                  </p>
                </div>
                <Switch
                  checked={settings.privacySettings.publicProfile}
                  onCheckedChange={(value) => handleNestedChange("privacySettings", "publicProfile", value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("backupAndSystem")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">{t("backupFrequency")}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {settings.backupFrequency === "daily" ? t("daily") : 
                       settings.backupFrequency === "weekly" ? t("weekly") : 
                       settings.backupFrequency === "monthly" ? t("monthly") : t("disabled")}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => handleInputChange("backupFrequency", "daily")}>
                        {t("daily")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleInputChange("backupFrequency", "weekly")}>
                        {t("weekly")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleInputChange("backupFrequency", "monthly")}>
                        {t("monthly")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleInputChange("backupFrequency", "disabled")}>
                        {t("disabled")}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-4 pt-4">
                <Button variant="secondary">{t("backupNow")}</Button>
                <Button variant="outline">{t("restoreFromBackup")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("smsProvider")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                {t("smsProviderDesc")}
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsProvider">{t("smsProviderSelect")}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {smsSettings.provider === "twilio" ? t("twilioProvider") : t("nexmoProvider")}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleSmsChange("provider", "twilio")}>
                          {t("twilioProvider")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSmsChange("provider", "nexmo")}>
                          {t("nexmoProvider")}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smsApiKey">{t("smsApiKey")}</Label>
                    <Input
                      id="smsApiKey"
                      value={smsSettings.apiKey}
                      onChange={(e) => handleSmsChange("apiKey", e.target.value)}
                      placeholder="xxxxxxxxxxxxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smsApiSecret">{t("smsApiSecret")}</Label>
                    <Input
                      id="smsApiSecret"
                      type="password"
                      value={smsSettings.apiSecret}
                      onChange={(e) => handleSmsChange("apiSecret", e.target.value)}
                      placeholder="••••••••••••••••••••"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smsFromNumber">{t("smsFromNumber")}</Label>
                  <Input
                    id="smsFromNumber"
                    value={smsSettings.fromNumber}
                    onChange={(e) => handleSmsChange("fromNumber", e.target.value)}
                    placeholder="+972xxxxxxxxx"
                  />
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="smsTestMessage">{t("smsTestMessage")}</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="smsTestMessage"
                        value={smsSettings.testMessage}
                        onChange={(e) => handleSmsChange("testMessage", e.target.value)}
                        placeholder="Enter a test message"
                        className="flex-1"
                      />
                      <Button onClick={sendTestMessage} type="button">
                        <Send className="mr-2 h-4 w-4" />
                        {t("smsTestMessage")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
