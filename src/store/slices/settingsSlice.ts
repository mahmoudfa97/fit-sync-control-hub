
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkingHours {
  weekdays: string;
  weekends: string;
}

interface BusinessInfo {
  taxNumber: string;
  commercialRegister: string;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  app: boolean;
}

interface PrivacySettings {
  shareData: boolean;
  membersCanSeeOthers: boolean;
  publicProfile: boolean;
}

interface SettingsState {
  gymName: string;
  email: string;
  phone: string;
  address: string;
  notifications: NotificationSettings;
  language: string;
  theme: string;
  memberReminders: boolean;
  autoRenewals: boolean;
  workingHours: WorkingHours;
  taxRate: number;
  businessInfo: BusinessInfo;
  privacySettings: PrivacySettings;
  backupFrequency: string;
}

const initialState: SettingsState = {
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
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    },
    updateNotifications: (state, action: PayloadAction<NotificationSettings>) => {
      state.notifications = action.payload;
    },
    updateWorkingHours: (state, action: PayloadAction<WorkingHours>) => {
      state.workingHours = action.payload;
    },
    updateBusinessInfo: (state, action: PayloadAction<BusinessInfo>) => {
      state.businessInfo = action.payload;
    },
    updatePrivacySettings: (state, action: PayloadAction<PrivacySettings>) => {
      state.privacySettings = action.payload;
    },
  },
});

export const { 
  updateSettings, 
  updateNotifications, 
  updateWorkingHours, 
  updateBusinessInfo, 
  updatePrivacySettings 
} = settingsSlice.actions;

export default settingsSlice.reducer;
