
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
import { ChevronDown } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    gymName: "سبارتا جيم",
    email: "info@spartagym.com",
    phone: "0501234567",
    address: "طريق الملك فهد، الرياض",
    notifications: {
      email: true,
      sms: false,
      app: true,
    },
    language: "ar",
    theme: "light",
    memberReminders: true,
    autoRenewals: true,
    workingHours: {
      weekdays: "6:00 ص - 10:00 م",
      weekends: "8:00 ص - 6:00 م",
    },
    taxRate: 15,
    businessInfo: {
      taxNumber: "123456789",
      commercialRegister: "1234567890",
    },
    privacySettings: {
      shareData: false,
      membersCanSeeOthers: false,
      publicProfile: true,
    },
    backupFrequency: "daily",
  });

  const handleInputChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleNestedChange = (parent, field, value) => {
    setSettings({
      ...settings,
      [parent]: {
        ...settings[parent],
        [field]: value,
      },
    });
  };

  const saveSettings = () => {
    // Save settings logic would go here
    toast.success("تم حفظ الإعدادات بنجاح");
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
          <p className="text-muted-foreground">
            قم بإدارة وتخصيص إعدادات وتفضيلات صالتك الرياضية
          </p>
        </div>
        <Button onClick={saveSettings}>حفظ الإعدادات</Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="business">معلومات الأعمال</TabsTrigger>
          <TabsTrigger value="privacy">الخصوصية والأمان</TabsTrigger>
          <TabsTrigger value="system">النظام والنسخ الاحتياطي</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gymName">اسم الصالة الرياضية</Label>
                  <Input
                    id="gymName"
                    value={settings.gymName}
                    onChange={(e) => handleInputChange("gymName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">اللغة</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {settings.language === "ar" ? "العربية" : "English"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleInputChange("language", "ar")}>
                          العربية
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
                <Label htmlFor="address">العنوان</Label>
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
              <CardTitle>ساعات العمل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weekdays">أيام الأسبوع</Label>
                  <Input
                    id="weekdays"
                    value={settings.workingHours.weekdays}
                    onChange={(e) => handleNestedChange("workingHours", "weekdays", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekends">عطلة نهاية الأسبوع</Label>
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
              <CardTitle>إعدادات الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    تلقي إشعارات عبر البريد الإلكتروني
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(value) => handleNestedChange("notifications", "email", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات الرسائل النصية</Label>
                  <p className="text-sm text-muted-foreground">
                    تلقي إشعارات عبر الرسائل النصية
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={(value) => handleNestedChange("notifications", "sms", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات التطبيق</Label>
                  <p className="text-sm text-muted-foreground">
                    تلقي إشعارات داخل التطبيق
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
              <CardTitle>تذكيرات الأعضاء</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تذكيرات انتهاء العضوية</Label>
                  <p className="text-sm text-muted-foreground">
                    إرسال تذكيرات قبل انتهاء عضوية الأعضاء
                  </p>
                </div>
                <Switch
                  checked={settings.memberReminders}
                  onCheckedChange={(value) => handleInputChange("memberReminders", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>التجديد التلقائي</Label>
                  <p className="text-sm text-muted-foreground">
                    تجديد العضويات تلقائياً عند انتهائها
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
              <CardTitle>معلومات الأعمال</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                  <Input
                    id="taxNumber"
                    value={settings.businessInfo.taxNumber}
                    onChange={(e) => handleNestedChange("businessInfo", "taxNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commercialRegister">السجل التجاري</Label>
                  <Input
                    id="commercialRegister"
                    value={settings.businessInfo.commercialRegister}
                    onChange={(e) => handleNestedChange("businessInfo", "commercialRegister", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">نسبة الضريبة (%)</Label>
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
              <CardTitle>الخصوصية والأمان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>مشاركة البيانات</Label>
                  <p className="text-sm text-muted-foreground">
                    مشاركة البيانات مع شركاء خارجيين
                  </p>
                </div>
                <Switch
                  checked={settings.privacySettings.shareData}
                  onCheckedChange={(value) => handleNestedChange("privacySettings", "shareData", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>رؤية الأعضاء</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح للأعضاء برؤية أعضاء آخرين
                  </p>
                </div>
                <Switch
                  checked={settings.privacySettings.membersCanSeeOthers}
                  onCheckedChange={(value) => handleNestedChange("privacySettings", "membersCanSeeOthers", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>الملف الشخصي العام</Label>
                  <p className="text-sm text-muted-foreground">
                    جعل ملف الصالة الرياضية عاماً
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
              <CardTitle>النسخ الاحتياطي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">تكرار النسخ الاحتياطي</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {settings.backupFrequency === "daily" ? "يومي" : 
                       settings.backupFrequency === "weekly" ? "أسبوعي" : 
                       settings.backupFrequency === "monthly" ? "شهري" : "معطل"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => handleInputChange("backupFrequency", "daily")}>
                        يومي
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleInputChange("backupFrequency", "weekly")}>
                        أسبوعي
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleInputChange("backupFrequency", "monthly")}>
                        شهري
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleInputChange("backupFrequency", "disabled")}>
                        معطل
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-4 pt-4">
                <Button variant="secondary">إجراء نسخ احتياطي الآن</Button>
                <Button variant="outline">استعادة من نسخة احتياطية</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
