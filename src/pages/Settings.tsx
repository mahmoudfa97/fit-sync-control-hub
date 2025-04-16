"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Send, Loader2 } from "lucide-react"
import { t } from "@/utils/translations"
import { supabase } from "@/integrations/supabase/client"
import { sendSms } from "@/services/SMS-Serivce"

// Define types for settings
interface WorkingHours {
  weekdays: string
  weekends: string
}

interface BusinessInfo {
  taxNumber: string
  commercialRegister: string
}

interface PrivacySettings {
  shareData: boolean
  membersCanSeeOthers: boolean
  publicProfile: boolean
}

interface Notifications {
  email: boolean
  sms: boolean
  app: boolean
}

interface SmsSettings {
  provider: string
  apiKey: string
  apiSecret: string
  fromNumber: string
  testMessage: string
}

interface Settings {
  id?: string
  gymName: string
  email: string
  phone: string
  language: string
  address: string
  workingHours: WorkingHours
  notifications: Notifications
  memberReminders: boolean
  autoRenewals: boolean
  businessInfo: BusinessInfo
  taxRate: number
  privacySettings: PrivacySettings
  backupFrequency: string
  smsSettings: SmsSettings
  organizationId?: string
  created_at?: string
  updated_at?: string
}

// Default settings
const defaultSettings: Settings = {
  gymName: "",
  email: "",
  phone: "",
  language: "he",
  address: "",
  workingHours: {
    weekdays: "08:00-22:00",
    weekends: "09:00-18:00",
  },
  notifications: {
    email: true,
    sms: true,
    app: true,
  },
  memberReminders: true,
  autoRenewals: false,
  businessInfo: {
    taxNumber: "",
    commercialRegister: "",
  },
  taxRate: 17,
  privacySettings: {
    shareData: false,
    membersCanSeeOthers: false,
    publicProfile: true,
  },
  backupFrequency: "weekly",
  smsSettings: {
    provider: "twilio",
    apiKey: "",
    apiSecret: "",
    fromNumber: "",
    testMessage: "This is a test message from your gym management system.",
  },
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  // Fetch settings from Supabase
  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true)

        // Get organization ID from user profile or use a default
        // In a real app, you would get this from auth context
        const organizationId = "default-org"

        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("organization_id", organizationId)
          .single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned" error, which is expected if no settings exist yet
          console.error("Error fetching settings:", error)
          toast.error(t("errorFetchingSettings"))
          return
        }

        if (data) {
          // Convert snake_case database fields to camelCase for the component
          const formattedData = {
            id: data.id,
            gymName: data.gym_name || "",
            email: data.email || "",
            phone: data.phone || "",
            language: data.language || "he",
            address: data.address || "",
            workingHours: data.working_hours || defaultSettings.workingHours,
            notifications: data.notifications || defaultSettings.notifications,
            memberReminders: data.member_reminders || true,
            autoRenewals: data.auto_renewals || false,
            businessInfo: data.business_info || defaultSettings.businessInfo,
            taxRate: data.tax_rate || 17,
            privacySettings: data.privacy_settings || defaultSettings.privacySettings,
            backupFrequency: data.backup_frequency || "weekly",
            smsSettings: data.sms_settings || defaultSettings.smsSettings,
            organizationId: data.organization_id,
            created_at: data.created_at,
            updated_at: data.updated_at,
          }
          setSettings(formattedData)
        }
      } catch (error) {
        console.error("Error in fetchSettings:", error)
        toast.error(t("errorFetchingSettings"))
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle nested changes
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof Settings],
        [field]: value,
      },
    }))
  }

  // Save settings to Supabase
  const saveSettings = async () => {
    try {
      setSaving(true)

      // Get organization ID from user profile or use a default
      const organizationId = "default-org"

      // Convert camelCase to snake_case for database
      const settingsToSave = {
        organization_id: organizationId,
        gym_name: settings.gymName,
        email: settings.email,
        phone: settings.phone,
        language: settings.language,
        address: settings.address,
        working_hours: settings.workingHours,
        notifications: settings.notifications,
        member_reminders: settings.memberReminders,
        auto_renewals: settings.autoRenewals,
        business_info: settings.businessInfo,
        tax_rate: settings.taxRate,
        privacy_settings: settings.privacySettings,
        backup_frequency: settings.backupFrequency,
        sms_settings: settings.smsSettings,
        updated_at: new Date().toISOString(),
      }

      // Check if settings already exist
      const { data: existingData, error: checkError } = await supabase
        .from("settings")
        .select("id")
        .eq("organization_id", organizationId)
        .maybeSingle()

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError
      }

      let result

      if (existingData?.id) {
        // Update existing settings
        result = await supabase.from("settings").update(settingsToSave).eq("id", existingData.id).select()
      } else {
        // Insert new settings
        result = await supabase
          .from("settings")
          .insert({
            ...settingsToSave,
            created_at: new Date().toISOString(),
          })
          .select()
      }

      if (result.error) {
        throw result.error
      }

      toast.success(t("settingsSaved"))
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error(t("errorSavingSettings"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("settings")}</h1>
          <p className="text-muted-foreground">{t("settingsDesc")}</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("saving")}
            </>
          ) : (
            t("saveSettings")
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                        {settings.language === "he" ? "עברית" : "English"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleInputChange("language", "he")}>עברית</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange("language", "en")}>English</DropdownMenuItem>
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
                  <p className="text-sm text-muted-foreground">{t("receiveEmailNotifications")}</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(value) => handleNestedChange("notifications", "email", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("smsNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">{t("receiveSmsNotifications")}</p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={(value) => handleNestedChange("notifications", "sms", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("appNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">{t("receiveAppNotifications")}</p>
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
                  <p className="text-sm text-muted-foreground">{t("sendRemindersBeforeExpiry")}</p>
                </div>
                <Switch
                  checked={settings.memberReminders}
                  onCheckedChange={(value) => handleInputChange("memberReminders", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("autoRenewals")}</Label>
                  <p className="text-sm text-muted-foreground">{t("renewMembershipsAutomatically")}</p>
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
                    onChange={(e) => handleInputChange("taxRate", Number.parseInt(e.target.value))}
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
                  <p className="text-sm text-muted-foreground">{t("shareDataWithPartners")}</p>
                </div>
                <Switch
                  checked={settings.privacySettings.shareData}
                  onCheckedChange={(value) => handleNestedChange("privacySettings", "shareData", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("memberVisibility")}</Label>
                  <p className="text-sm text-muted-foreground">{t("membersCanSeeOthers")}</p>
                </div>
                <Switch
                  checked={settings.privacySettings.membersCanSeeOthers}
                  onCheckedChange={(value) => handleNestedChange("privacySettings", "membersCanSeeOthers", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("publicProfile")}</Label>
                  <p className="text-sm text-muted-foreground">{t("makeGymProfilePublic")}</p>
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
                      {settings.backupFrequency === "daily"
                        ? t("daily")
                        : settings.backupFrequency === "weekly"
                          ? t("weekly")
                          : settings.backupFrequency === "monthly"
                            ? t("monthly")
                            : t("disabled")}
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
                <Button variant="secondary" onClick={() => toast.success(t("backupStarted"))}>
                  {t("backupNow")}
                </Button>
                <Button variant="outline" onClick={() => toast.info(t("restoreNotImplemented"))}>
                  {t("restoreFromBackup")}
                </Button>
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
              <p className="text-sm text-muted-foreground mb-4">{t("smsProviderDesc")}</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsProvider">{t("smsProviderSelect")}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {settings.smsSettings.provider === "twilio" ? t("twilioProvider") : t("nexmoProvider")}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleNestedChange("smsSettings", "provider", "twilio")}>
                          {t("twilioProvider")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNestedChange("smsSettings", "provider", "nexmo")}>
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
                      value={settings.smsSettings.apiKey}
                      onChange={(e) => handleNestedChange("smsSettings", "apiKey", e.target.value)}
                      placeholder="xxxxxxxxxxxxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smsApiSecret">{t("smsApiSecret")}</Label>
                    <Input
                      id="smsApiSecret"
                      type="password"
                      value={settings.smsSettings.apiSecret}
                      onChange={(e) => handleNestedChange("smsSettings", "apiSecret", e.target.value)}
                      placeholder="••••••••••••••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smsFromNumber">{t("smsFromNumber")}</Label>
                  <Input
                    id="smsFromNumber"
                    value={settings.smsSettings.fromNumber}
                    onChange={(e) => handleNestedChange("smsSettings", "fromNumber", e.target.value)}
                    placeholder="+972xxxxxxxxx"
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="smsTestMessage">{t("smsTestMessage")}</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="smsTestMessage"
                        value={settings.smsSettings.testMessage}
                        onChange={(e) => handleNestedChange("smsSettings", "testMessage", e.target.value)}
                        placeholder="Enter a test message"
                        className="flex-1"
                      />
                  
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
