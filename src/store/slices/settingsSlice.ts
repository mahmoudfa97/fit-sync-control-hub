
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
  gymName: "ספרטה ג'ים", // Changed to Hebrew
  email: "info@spartagym.com",
  phone: "0501234567",
  address: "דרך העצמאות, תל אביב", // Changed to Hebrew
  notifications: {
    email: true,
    sms: false,
    app: true,
  },
  language: "he", // Changed to Hebrew language code
  theme: "light",
  memberReminders: true,
  autoRenewals: true,
  workingHours: {
    weekdays: "6:00 - 22:00", // Changed to 24-hour format
    weekends: "8:00 - 18:00", // Changed to 24-hour format
  },
  taxRate: 17, // Changed to Israeli VAT rate
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
