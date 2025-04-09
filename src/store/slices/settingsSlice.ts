
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GeneralSettings {
  gymName: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  openingHours: {
    weekdays: string;
    weekends: string;
  };
  currency: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  description: string;
  features: string[];
  isActive: boolean;
}

export interface Notification {
  membersAboutToExpire: boolean;
  newMemberships: boolean;
  lowAttendance: boolean;
  paymentReminders: boolean;
  daysBeforeExpiry: number;
}

interface SettingsState {
  general: GeneralSettings;
  membershipPlans: MembershipPlan[];
  notifications: Notification;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  language: 'ar' | 'en';
}

const initialState: SettingsState = {
  general: {
    gymName: 'سبارتا جيم',
    logo: '/logo.png',
    address: 'شارع التحلية، حي السلامة، جدة، المملكة العربية السعودية',
    phone: '+966-12-345-6789',
    email: 'info@spartagym.com',
    website: 'www.spartagym.com',
    openingHours: {
      weekdays: '6:00 ص - 11:00 م',
      weekends: '8:00 ص - 9:00 م',
    },
    currency: 'ريال',
  },
  membershipPlans: [
    {
      id: 'plan-1',
      name: 'الاشتراك الشهري',
      price: 299,
      duration: 30,
      description: 'اشتراك شهري مع إمكانية الوصول إلى جميع المرافق الأساسية',
      features: [
        'استخدام الصالة الرياضية',
        'استخدام المسبح',
        'الدخول المجاني للحصص الجماعية',
      ],
      isActive: true,
    },
    {
      id: 'plan-2',
      name: 'الاشتراك الفصلي',
      price: 799,
      duration: 90,
      description: 'اشتراك لمدة ثلاثة أشهر مع خصم خاص',
      features: [
        'استخدام الصالة الرياضية',
        'استخدام المسبح',
        'الدخول المجاني للحصص الجماعية',
        'جلسة مجانية مع مدرب شخصي',
      ],
      isActive: true,
    },
    {
      id: 'plan-3',
      name: 'الاشتراك السنوي',
      price: 2499,
      duration: 365,
      description: 'أفضل قيمة مع اشتراك سنوي كامل',
      features: [
        'استخدام الصالة الرياضية',
        'استخدام المسبح',
        'الدخول المجاني للحصص الجماعية',
        '4 جلسات مجانية مع مدرب شخصي',
        'استشارة مجانية للتغذية',
        'توصيل مجاني لبطاقة العضوية',
      ],
      isActive: true,
    },
    {
      id: 'plan-4',
      name: 'العضوية البريميوم',
      price: 4999,
      duration: 365,
      description: 'تجربة VIP لمحبي الرفاهية',
      features: [
        'استخدام الصالة الرياضية على مدار 24 ساعة',
        'استخدام المسبح',
        'الدخول المجاني للحصص الجماعية',
        '12 جلسة مع مدرب شخصي',
        'خطة تغذية مخصصة',
        'خزانة خاصة',
        'موقف سيارات محجوز',
        'استخدام منطقة السبا والساونا',
      ],
      isActive: true,
    },
  ],
  notifications: {
    membersAboutToExpire: true,
    newMemberships: true,
    lowAttendance: true,
    paymentReminders: true,
    daysBeforeExpiry: 7,
  },
  backupFrequency: 'daily',
  language: 'ar',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateGeneralSettings: (state, action: PayloadAction<Partial<GeneralSettings>>) => {
      state.general = { ...state.general, ...action.payload };
    },
    addMembershipPlan: (state, action: PayloadAction<MembershipPlan>) => {
      state.membershipPlans.push(action.payload);
    },
    updateMembershipPlan: (state, action: PayloadAction<MembershipPlan>) => {
      const index = state.membershipPlans.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.membershipPlans[index] = action.payload;
      }
    },
    deleteMembershipPlan: (state, action: PayloadAction<string>) => {
      state.membershipPlans = state.membershipPlans.filter(p => p.id !== action.payload);
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<Notification>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updateBackupFrequency: (state, action: PayloadAction<'daily' | 'weekly' | 'monthly'>) => {
      state.backupFrequency = action.payload;
    },
    changeLanguage: (state, action: PayloadAction<'ar' | 'en'>) => {
      state.language = action.payload;
    },
  },
});

export const { 
  updateGeneralSettings,
  addMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  updateNotificationSettings,
  updateBackupFrequency,
  changeLanguage
} = settingsSlice.actions;
export default settingsSlice.reducer;
