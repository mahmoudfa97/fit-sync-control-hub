
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'receptionist' | 'trainer' | 'maintenance' | 'other';
  joinDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  speciality?: string;
  workDays?: string[];
  workHours?: string;
  salary?: number;
  notes?: string;
  avatar?: string;
  initials: string;
}

interface StaffState {
  staff: StaffMember[];
}

const initialState: StaffState = {
  staff: [
    {
      id: "trainer-1",
      name: "سارة الأحمد",
      email: "sara.a@spartagym.com",
      phone: "055-1111111",
      role: "trainer",
      joinDate: "2023-06-15",
      status: "active",
      speciality: "يوغا، بيلاتس",
      workDays: ["monday", "wednesday", "saturday"],
      workHours: "8:00 - 14:00",
      salary: 6000,
      initials: "سأ",
    },
    {
      id: "trainer-2",
      name: "أحمد المالكي",
      email: "ahmed.m@spartagym.com",
      phone: "050-2222222",
      role: "trainer",
      joinDate: "2023-08-01",
      status: "active",
      speciality: "تدريب قوة، كارديو",
      workDays: ["sunday", "tuesday", "thursday"],
      workHours: "16:00 - 22:00",
      salary: 7000,
      initials: "أم",
    },
    {
      id: "trainer-3",
      name: "لينا القحطاني",
      email: "lina.q@spartagym.com",
      phone: "055-3333333",
      role: "trainer",
      joinDate: "2023-09-10",
      status: "active",
      speciality: "زومبا، رقص هوائي",
      workDays: ["monday", "wednesday", "friday"],
      workHours: "17:00 - 21:00",
      salary: 5500,
      initials: "لق",
    },
    {
      id: "manager-1",
      name: "فهد الدوسري",
      email: "fahad.d@spartagym.com",
      phone: "050-4444444",
      role: "manager",
      joinDate: "2023-01-01",
      status: "active",
      workDays: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
      workHours: "9:00 - 17:00",
      salary: 12000,
      initials: "فد",
    },
    {
      id: "receptionist-1",
      name: "نورة العتيبي",
      email: "noura.o@spartagym.com",
      phone: "055-5555555",
      role: "receptionist",
      joinDate: "2023-03-15",
      status: "active",
      workDays: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
      workHours: "8:00 - 16:00",
      salary: 4500,
      initials: "نع",
    },
    {
      id: "maintenance-1",
      name: "سعد الحربي",
      email: "saad.h@spartagym.com",
      phone: "050-6666666",
      role: "maintenance",
      joinDate: "2023-02-10",
      status: "active",
      workDays: ["sunday", "tuesday", "thursday", "saturday"],
      workHours: "7:00 - 15:00",
      salary: 4000,
      initials: "سح",
    },
  ],
};

export const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    addStaff: (state, action: PayloadAction<StaffMember>) => {
      state.staff.push(action.payload);
    },
    updateStaff: (state, action: PayloadAction<StaffMember>) => {
      const index = state.staff.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.staff[index] = action.payload;
      }
    },
    removeStaff: (state, action: PayloadAction<string>) => {
      state.staff = state.staff.filter(s => s.id !== action.payload);
    },
    updateStaffStatus: (state, action: PayloadAction<{id: string, status: StaffMember['status']}>) => {
      const index = state.staff.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.staff[index].status = action.payload.status;
      }
    },
  },
});

export const { addStaff, updateStaff, removeStaff, updateStaffStatus } = staffSlice.actions;
export default staffSlice.reducer;
