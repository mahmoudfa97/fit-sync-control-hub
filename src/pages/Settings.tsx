import { useState } from "react";
import { 
  Save, 
  Building,
  CreditCard,
  Bell,
  Database,
  Languages,
  Plus,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { 
  updateGeneralSettings,
  addMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  updateNotificationSettings,
  updateBackupFrequency,
  changeLanguage,
} from "@/store/slices/settingsSlice";

export default function Settings() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);
  const { toast } = useToast();
  
  const [generalSettings, setGeneralSettings] = useState({ ...settings.general });
  const [notifications, setNotifications] = useState({ ...settings.notifications });
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
    features: [""] as string[],
  });
  
  const handleUpdateGeneralSettings = () => {
    dispatch(updateGeneralSettings(generalSettings));
    toast({
      title: "تم التحديث",
      description: "تم تحديث الإعدادات العامة بنجاح",
    });
  };
  
  const handleUpdateNotifications = () => {
    dispatch(updateNotificationSettings(notifications));
    toast({
      title: "تم التحديث",
      description: "تم تحديث إعدادات الإشعارات بنجاح",
    });
  };
  
  const handleUpdateBackupFrequency = (frequency: 'daily' | 'weekly' | 'monthly') => {
    dispatch(updateBackupFrequency(frequency));
    toast({
      title: "تم التحديث",
      description: `تم تغيير تكرار النسخ الاحتياطي إلى ${
        frequency === 'daily' ? 'يومي' : 
        frequency === 'weekly' ? 'أسبوعي' : 'شهري'
      }`,
    });
  };
  
  const handleChangeLanguage = (language: 'ar' | 'en') => {
    dispatch(changeLanguage(language));
    toast({
      title: "تم التحديث",
      description: `تم تغيير اللغة إلى ${language === 'ar' ? 'العربية' : 'الإنجليزية'}`,
    });
  };
  
  const handleAddFeatureField = () => {
    setNewPlan({
      ...newPlan,
      features: [...newPlan.features, ""]
    });
  };
  
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...newPlan.features];
    updatedFeatures[index] = value;
    setNewPlan({
      ...newPlan,
      features: updatedFeatures
    });
  };
  
  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...newPlan.features];
    updatedFeatures.splice(index, 1);
    setNewPlan({
      ...newPlan,
      features: updatedFeatures
    });
  };
  
  const handleAddPlan = () => {
    if (!newPlan.name || !newPlan.price || !newPlan.duration) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    const filteredFeatures = newPlan.features.filter(f => f.trim() !== "");
    
    const planToAdd = {
      id: `plan-${Date.now()}`,
      name: newPlan.name,
      price: Number(newPlan.price),
      duration: Number(newPlan.duration),
      description: newPlan.description,
      features: filteredFeatures,
      isActive: true,
    };
    
    dispatch(addMembershipPlan(planToAdd));
    
    toast({
      title: "تم الإضافة",
      description: `تمت إضافة خطة ${newPlan.name} بنجاح`,
    });
    
    setNewPlan({
      name: "",
      price: "",
      duration: "",
      description: "",
      features: [""],
    });
  };
  
  const handleDeletePlan = (planId: string) => {
    dispatch(deleteMembershipPlan(planId));
    toast({
      title: "تم الحذف",
      description: "تم حذف الخطة بنجاح",
    });
  };
  
  const handleTogglePlanStatus = (plan: typeof settings.membershipPlans[0]) => {
    dispatch(updateMembershipPlan({
      ...plan,
      isActive: !plan.isActive
    }));
    
    toast({
      title: "تم التحديث",
      description: `تم ${plan.isActive ? 'إلغاء تفعيل' : 'تفعيل'} خطة ${plan.name}`,
    });
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
          <p className="text-muted-foreground">
            تخصيص وإدارة إعدادات صالتك الرياضية.
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">الإعدادات العامة</TabsTrigger>
          <TabsTrigger value="memberships">خطط العضوية</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="system">النظام</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
              <CardDescription>
                اضبط البيانات الأساسية للصالة الرياضية هنا.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gymName">اسم الصالة الرياضية</Label>
                  <Input 
                    id="gymName" 
                    value={generalSettings.gymName}
                    onChange={(e) => setGeneralSettings({...generalSettings, gymName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">العملة</Label>
                  <Input 
                    id="currency" 
                    value={generalSettings.currency}
                    onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea 
                  id="address" 
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({...generalSettings, address: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input 
                    id="phone" 
                    value={generalSettings.phone}
                    onChange={(e) => setGeneralSettings({...generalSettings, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input 
                    id="email" 
                    value={generalSettings.email}
                    onChange={(e) => setGeneralSettings({...generalSettings, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                  <Input 
                    id="website" 
                    value={generalSettings.website}
                    onChange={(e) => setGeneralSettings({...generalSettings, website: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weekdaysHours">ساعات العمل (أيام الأسبوع)</Label>
                  <Input 
                    id="weekdaysHours" 
                    value={generalSettings.openingHours.weekdays}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings, 
                      openingHours: {
                        ...generalSettings.openingHours,
                        weekdays: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekendsHours">ساعات العمل (نهاية الأسبوع)</Label>
                  <Input 
                    id="weekendsHours" 
                    value={generalSettings.openingHours.weekends}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings, 
                      openingHours: {
                        ...generalSettings.openingHours,
                        weekends: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpdateGeneralSettings}>
                <Save className="mr-2 h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="memberships">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Existing Plans */}
            {settings.membershipPlans.map((plan) => (
              <Card key={plan.id} className={`${!plan.isActive ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{plan.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => handleTogglePlanStatus(plan)}>
                            {plan.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePlan(plan.id)}>
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold">
                    {plan.price} {settings.general.currency}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    لمدة {plan.duration} يوم
                  </div>
                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-2">المميزات:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-sm flex">
                          <span className="text-green-600 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Plan */}
            <Card>
              <CardHeader>
                <CardTitle>إضافة خطة جديدة</CardTitle>
                <CardDescription>
                  أضف خطة جديدة إلى قائمة خطط العضوية.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">اسم الخطة</Label>
                  <Input 
                    id="planName" 
                    placeholder="مثال: الخطة الشهرية"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="planPrice">السعر ({settings.general.currency})</Label>
                    <Input 
                      id="planPrice" 
                      type="number" 
                      placeholder="0"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="planDuration">المدة (بالأيام)</Label>
                    <Input 
                      id="planDuration" 
                      type="number" 
                      placeholder="30"
                      value={newPlan.duration}
                      onChange={(e) => setNewPlan({...newPlan, duration: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planDescription">الوصف</Label>
                  <Textarea 
                    id="planDescription" 
                    placeholder="وصف مختصر للخطة"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>المميزات</Label>
                    <Button variant="ghost" size="sm" onClick={handleAddFeatureField}>
                      <Plus className="h-4 w-4 mr-1" />
                      إضافة ميزة
                    </Button>
                  </div>
                  {newPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input 
                        placeholder="ميزة جديدة"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                      />
                      {index > 0 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddPlan}>
                  <Plus className="mr-2 h-4 w-4" />
                  إضافة الخطة
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>
                تحكم في كيفية إشعارك بالأحداث المهمة في صالتك الرياضية.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">إشعارات العضوية</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="membersAboutToExpire">الأعضاء الذين تقترب عضويتهم من الانتهاء</Label>
                      <p className="text-sm text-muted-foreground">
                        تلقي إشعارات عن الأعضاء الذين تقترب عضويتهم من الانتهاء
                      </p>
                    </div>
                    <Switch 
                      id="membersAboutToExpire" 
                      checked={notifications.membersAboutToExpire}
                      onCheckedChange={(checked) => setNotifications({...notifications, membersAboutToExpire: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="newMemberships">عضويات جديدة</Label>
                      <p className="text-sm text-muted-foreground">
                        تلقي إشعارات عند تسجيل أعضاء جدد
                      </p>
                    </div>
                    <Switch 
                      id="newMemberships" 
                      checked={notifications.newMemberships}
                      onCheckedChange={(checked) => setNotifications({...notifications, newMemberships: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="lowAttendance">انخفاض نسبة الحضور</Label>
                      <p className="text-sm text-muted-foreground">
                        تلقي إشعارات عندما ينخفض حضور الأعضاء بشكل ملحوظ
                      </p>
                    </div>
                    <Switch 
                      id="lowAttendance" 
                      checked={notifications.lowAttendance}
                      onCheckedChange={(checked) => setNotifications({...notifications, lowAttendance: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="paymentReminders">تذكيرات الدفع</Label>
                      <p className="text-sm text-muted-foreground">
                        تلقي إشعارات للتذكير بمدفوعات متأخرة أو مستحقة
                      </p>
                    </div>
                    <Switch 
                      id="paymentReminders" 
                      checked={notifications.paymentReminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, paymentReminders: checked})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">إعدادات التذكير</h3>
                <div className="space-y-2">
                  <Label htmlFor="daysBeforeExpiry">عدد الأيام قبل انتهاء العضوية للتذكير</Label>
                  <div className="flex w-full max-w-sm items-center gap-2">
                    <Input 
                      id="daysBeforeExpiry" 
                      type="number" 
                      value={notifications.daysBeforeExpiry}
                      onChange={(e) => setNotifications({
                        ...notifications, 
                        daysBeforeExpiry: parseInt(e.target.value) || 0
                      })}
                    />
                    <span>أيام</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpdateNotifications}>
                <Save className="mr-2 h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>النسخ الاحتياطي</CardTitle>
                </div>
                <CardDescription>
                  إعدادات النسخ الاحتياطي وحفظ البيانات.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>تكرار النسخ الاحتياطي</Label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => handleUpdateBackupFrequency(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="monthly">شهري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-6">
                  <Button variant="outline">
                    إنشاء نسخة احتياطية الآن
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>اللغة</CardTitle>
                </div>
                <CardDescription>
                  تغيير لغة واجهة النظام.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>لغة النظام</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value: 'ar' | 'en') => handleChangeLanguage(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
