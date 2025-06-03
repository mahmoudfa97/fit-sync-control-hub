import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface WorkingHours {
  weekdays: string;
  weekends: string;
}

interface Notifications {
  email: boolean;
  sms: boolean;
  app: boolean;
}

interface BusinessInfo {
  taxNumber: string;
  commercialRegister: string;
  [key: string]: Json;
}

interface PrivacySettings {
  shareData: boolean;
  membersCanSeeOthers: boolean;
  publicProfile: boolean;
}

interface SmsSettings {
  provider: string;
  apiKey: string;
  apiSecret: string;
  fromNumber: string;
  testMessage: string;
}

interface Settings {
  id: string;
  gymName: string;
  email: string;
  phone: string;
  language: string;
  address: string;
  workingHours: WorkingHours;
  notifications: Notifications;
  memberReminders: boolean;
  autoRenewals: boolean;
  businessInfo: BusinessInfo;
  taxRate: number;
  privacySettings: PrivacySettings;
  smsSettings: SmsSettings;
  backupFrequency: string;
  createdAt: string;
  updatedAt: string;
}

const defaultSettings: Settings = {
  id: "",
  gymName: "",
  email: "",
  phone: "",
  language: "he",
  address: "",
  workingHours: {
    weekdays: "08:00-22:00",
    weekends: "09:00-18:00"
  },
  notifications: {
    email: true,
    sms: true,
    app: true
  },
  memberReminders: true,
  autoRenewals: false,
  businessInfo: {
    taxNumber: "",
    commercialRegister: ""
  },
  taxRate: 17,
  privacySettings: {
    shareData: false,
    membersCanSeeOthers: false,
    publicProfile: true
  },
  smsSettings: {
    provider: "twilio",
    apiKey: "",
    apiSecret: "",
    fromNumber: "",
    testMessage: "This is a test message from your gym management system."
  },
  backupFrequency: "weekly",
  createdAt: "",
  updatedAt: ""
};

export default function Settings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        const loadedSettings: Settings = {
          id: data.id,
          gymName: data.gym_name || "",
          email: data.email || "",
          phone: data.phone || "",
          language: data.language || "he",
          address: data.address || "",
          workingHours: (data.working_hours as unknown as WorkingHours) || defaultSettings.workingHours,
          notifications: (data.notifications as unknown as Notifications) || defaultSettings.notifications,
          memberReminders: data.member_reminders ?? true,
          autoRenewals: data.auto_renewals ?? false,
          businessInfo: (data.business_info as unknown as BusinessInfo) || defaultSettings.businessInfo,
          taxRate: data.tax_rate || 17,
          privacySettings: (data.privacy_settings as unknown as PrivacySettings) || defaultSettings.privacySettings,
          smsSettings: (data.sms_settings as unknown as SmsSettings) || defaultSettings.smsSettings,
          backupFrequency: data.backup_frequency || "weekly",
          createdAt: data.created_at || "",
          updatedAt: data.updated_at || ""
        };
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("שגיאה בטעינת ההגדרות");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const settingsData = {
        organization_id: "default",
        gym_name: settings.gymName,
        email: settings.email,
        phone: settings.phone,
        language: settings.language,
        address: settings.address,
        working_hours: settings.workingHours as Json,
        notifications: settings.notifications as Json,
        member_reminders: settings.memberReminders,
        auto_renewals: settings.autoRenewals,
        business_info: settings.businessInfo as Json,
        tax_rate: settings.taxRate,
        privacy_settings: settings.privacySettings as Json,
        sms_settings: settings.smsSettings as Json,
        backup_frequency: settings.backupFrequency,
        updated_at: new Date().toISOString()
      };

      let result;
      if (settings.id) {
        result = await supabase
          .from("settings")
          .update(settingsData)
          .eq("id", settings.id);
      } else {
        result = await supabase
          .from("settings")
          .insert([{ ...settingsData, created_at: new Date().toISOString() }]);
      }

      if (result.error) throw result.error;

      toast.success("ההגדרות נשמרו בהצלחה");
      await loadSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("שגיאה בשמירת ההגדרות");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>טוען הגדרות...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">הגדרות</h1>
          <p className="text-muted-foreground">נהל את הגדרות המערכת שלך</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">כללי</TabsTrigger>
            <TabsTrigger value="notifications">התראות</TabsTrigger>
            <TabsTrigger value="business">עסק</TabsTrigger>
            <TabsTrigger value="privacy">פרטיות</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="backup">גיבוי</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>הגדרות כלליות</CardTitle>
                <CardDescription>הגדר את פרטי העסק הבסיסיים</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gymName">שם החדר כושר</Label>
                    <Input
                      id="gymName"
                      value={settings.gymName}
                      onChange={(e) => setSettings({...settings, gymName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">שפה</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="he">עברית</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">אימייל</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({...settings, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">טלפון</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">כתובת</Label>
                  <Textarea
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings({...settings, address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weekdays">שעות פעילות - ימי חול</Label>
                    <Input
                      id="weekdays"
                      value={settings.workingHours.weekdays}
                      onChange={(e) => setSettings({
                        ...settings,
                        workingHours: {...settings.workingHours, weekdays: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weekends">שעות פעילות - סופי שבוע</Label>
                    <Input
                      id="weekends"
                      value={settings.workingHours.weekends}
                      onChange={(e) => setSettings({
                        ...settings,
                        workingHours: {...settings.workingHours, weekends: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>הגדרות התראות</CardTitle>
                <CardDescription>בחר איך תרצה לקבל התראות</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">התראות אימייל</Label>
                  <Switch
                    id="email-notifications"
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, email: checked}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">התראות SMS</Label>
                  <Switch
                    id="sms-notifications"
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, sms: checked}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="app-notifications">התראות אפליקציה</Label>
                  <Switch
                    id="app-notifications"
                    checked={settings.notifications.app}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, app: checked}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="member-reminders">תזכורות לחברים</Label>
                  <Switch
                    id="member-reminders"
                    checked={settings.memberReminders}
                    onCheckedChange={(checked) => setSettings({...settings, memberReminders: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-renewals">חידושים אוטומטיים</Label>
                  <Switch
                    id="auto-renewals"
                    checked={settings.autoRenewals}
                    onCheckedChange={(checked) => setSettings({...settings, autoRenewals: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>פרטי עסק</CardTitle>
                <CardDescription>הגדר את פרטי העסק למסמכים רשמיים</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxNumber">מספר עוסק מורשה</Label>
                    <Input
                      id="taxNumber"
                      value={settings.businessInfo.taxNumber}
                      onChange={(e) => setSettings({
                        ...settings,
                        businessInfo: {...settings.businessInfo, taxNumber: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="commercialRegister">רישום מסחרי</Label>
                    <Input
                      id="commercialRegister"
                      value={settings.businessInfo.commercialRegister}
                      onChange={(e) => setSettings({
                        ...settings,
                        businessInfo: {...settings.businessInfo, commercialRegister: e.target.value}
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="taxRate">אחוז מס (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({...settings, taxRate: parseInt(e.target.value) || 0})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>הגדרות פרטיות</CardTitle>
                <CardDescription>בחר איך המידע שלך משותף</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="shareData">שתף נתונים לשיפור השירות</Label>
                  <Switch
                    id="shareData"
                    checked={settings.privacySettings.shareData}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      privacySettings: {...settings.privacySettings, shareData: checked}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="membersCanSeeOthers">חברים יכולים לראות חברים אחרים</Label>
                  <Switch
                    id="membersCanSeeOthers"
                    checked={settings.privacySettings.membersCanSeeOthers}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      privacySettings: {...settings.privacySettings, membersCanSeeOthers: checked}
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="publicProfile">פרופיל ציבורי</Label>
                  <Switch
                    id="publicProfile"
                    checked={settings.privacySettings.publicProfile}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      privacySettings: {...settings.privacySettings, publicProfile: checked}
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <CardTitle>הגדרות SMS</CardTitle>
                <CardDescription>הגדר את שירות ה-SMS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="provider">ספק שירות</Label>
                  <Select 
                    value={settings.smsSettings.provider} 
                    onValueChange={(value) => setSettings({
                      ...settings,
                      smsSettings: {...settings.smsSettings, provider: value}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="nexmo">Nexmo</SelectItem>
                      <SelectItem value="other">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={settings.smsSettings.apiKey}
                      onChange={(e) => setSettings({
                        ...settings,
                        smsSettings: {...settings.smsSettings, apiKey: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiSecret">API Secret</Label>
                    <Input
                      id="apiSecret"
                      type="password"
                      value={settings.smsSettings.apiSecret}
                      onChange={(e) => setSettings({
                        ...settings,
                        smsSettings: {...settings.smsSettings, apiSecret: e.target.value}
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="fromNumber">מספר שולח</Label>
                  <Input
                    id="fromNumber"
                    value={settings.smsSettings.fromNumber}
                    onChange={(e) => setSettings({
                      ...settings,
                      smsSettings: {...settings.smsSettings, fromNumber: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="testMessage">הודעת בדיקה</Label>
                  <Textarea
                    id="testMessage"
                    value={settings.smsSettings.testMessage}
                    onChange={(e) => setSettings({
                      ...settings,
                      smsSettings: {...settings.smsSettings, testMessage: e.target.value}
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle>הגדרות גיבוי</CardTitle>
                <CardDescription>בחר תדירות גיבוי נתונים</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="backupFrequency">תדירות גיבוי</Label>
                  <Select 
                    value={settings.backupFrequency} 
                    onValueChange={(value) => setSettings({...settings, backupFrequency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">יומי</SelectItem>
                      <SelectItem value="weekly">שבועי</SelectItem>
                      <SelectItem value="monthly">חודשי</SelectItem>
                      <SelectItem value="manual">ידני בלבד</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? "שומר..." : "שמור הגדרות"}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
