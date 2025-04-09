
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  schedule: {
    days: string[];
    shift: string;
  };
  initials: string;
  avatar?: string;
  speciality?: string;
  workDays?: string[];
  workHours?: string;
  salary?: number;
  notes?: string;
  joinDate?: string; // For backward compatibility
}

interface StaffState {
  staff: StaffMember[];
  filteredStaff: StaffMember[];
  filterDepartment: string | null;
}

const initialStaff: StaffMember[] = [
  {
    id: "staff-1",
    name: "سارة الأحمد",
    email: "sara.a@spartagym.com",
    phone: "055-1111111",
    role: "مدرب يوغا",
    department: "التدريب",
    hireDate: "15 يونيو، 2023",
    status: "active",
    schedule: {
      days: ["الاثنين", "الأربعاء", "السبت"],
      shift: "صباحي (8ص - 2م)"
    },
    initials: "سأ",
  },
  {
    id: "staff-2",
    name: "أحمد المالكي",
    email: "ahmed.m@spartagym.com",
    phone: "050-2222222",
    role: "مدرب شخصي",
    department: "التدريب",
    hireDate: "1 أغسطس، 2023",
    status: "active",
    schedule: {
      days: ["الأحد", "الثلاثاء", "الخميس"],
      shift: "مسائي (4م - 10م)"
    },
    initials: "أم",
  },
  {
    id: "staff-3",
    name: "لينا القحطاني",
    email: "lina.q@spartagym.com",
    phone: "055-3333333",
    role: "مدرب زومبا",
    department: "التدريب",
    hireDate: "10 سبتمبر، 2023",
    status: "active",
    schedule: {
      days: ["الاثنين", "الأربعاء", "الجمعة"],
      shift: "مسائي (5م - 9م)"
    },
    initials: "لق",
  },
  {
    id: "staff-4",
    name: "فهد الدوسري",
    email: "fahad.d@spartagym.com",
    phone: "050-4444444",
    role: "مدير النادي",
    department: "الإدارة",
    hireDate: "1 يناير، 2023",
    status: "active",
    schedule: {
      days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
      shift: "صباحي (9ص - 5م)"
    },
    initials: "فد",
  },
  {
    id: "staff-5",
    name: "نورة العتيبي",
    email: "noura.o@spartagym.com",
    phone: "055-5555555",
    role: "موظف استقبال",
    department: "الاستقبال",
    hireDate: "15 مارس، 2023",
    status: "active",
    schedule: {
      days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
      shift: "صباحي (8ص - 4م)"
    },
    initials: "نع",
  },
  {
    id: "staff-6",
    name: "سعد الحربي",
    email: "saad.h@spartagym.com",
    phone: "050-6666666",
    role: "مسؤول النظافة",
    department: "الصيانة",
    hireDate: "10 فبراير، 2023",
    status: "active",
    schedule: {
      days: ["الأحد", "الثلاثاء", "الخميس", "السبت"],
      shift: "صباحي (7ص - 3م)"
    },
    initials: "سح",
  },
];

const initialState: StaffState = {
  staff: initialStaff,
  filteredStaff: initialStaff,
  filterDepartment: null,
};

export const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    addStaff: (state, action: PayloadAction<StaffMember>) => {
      state.staff.push(action.payload);
      // Update filtered staff if filter matches or no filter
      if (!state.filterDepartment || action.payload.department === state.filterDepartment) {
        state.filteredStaff.push(action.payload);
      }
    },
    addStaffMember: (state, action: PayloadAction<StaffMember>) => {
      // Alias for addStaff for backward compatibility
      state.staff.push(action.payload);
      // Update filtered staff if filter matches or no filter
      if (!state.filterDepartment || action.payload.department === state.filterDepartment) {
        state.filteredStaff.push(action.payload);
      }
    },
    updateStaff: (state, action: PayloadAction<StaffMember>) => {
      const index = state.staff.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.staff[index] = action.payload;
      }
      // Update filtered staff
      state.filteredStaff = state.staff.filter(s => 
        !state.filterDepartment || s.department === state.filterDepartment
      );
    },
    removeStaff: (state, action: PayloadAction<string>) => {
      state.staff = state.staff.filter(s => s.id !== action.payload);
      state.filteredStaff = state.filteredStaff.filter(s => s.id !== action.payload);
    },
    updateStaffStatus: (state, action: PayloadAction<{id: string, status: StaffMember['status']}>) => {
      const index = state.staff.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.staff[index].status = action.payload.status;
      }
      // Update filtered staff
      state.filteredStaff = state.staff.filter(s => 
        !state.filterDepartment || s.department === state.filterDepartment
      );
    },
    filterStaffByDepartment: (state, action: PayloadAction<string | null>) => {
      state.filterDepartment = action.payload;
      if (action.payload) {
        state.filteredStaff = state.staff.filter(s => s.department === action.payload);
      } else {
        state.filteredStaff = state.staff;
      }
    },
    searchStaff: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload.toLowerCase();
      if (searchTerm) {
        state.filteredStaff = state.staff.filter(s => 
          s.name.toLowerCase().includes(searchTerm) || 
          s.email.toLowerCase().includes(searchTerm) ||
          s.role.toLowerCase().includes(searchTerm)
        );
      } else {
        state.filteredStaff = state.staff;
      }
    },
  },
});

export const { 
  addStaff, 
  addStaffMember,
  updateStaff, 
  removeStaff, 
  updateStaffStatus,
  filterStaffByDepartment,
  searchStaff
} = staffSlice.actions;

export default staffSlice.reducer;
