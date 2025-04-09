
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
}

interface StaffState {
  staff: StaffMember[];
  filteredStaff: StaffMember[];
  departmentFilter: string | null;
}

const generateDummyStaff = (): StaffMember[] => {
  const roles = [
    { title: "مدرب شخصي", dept: "التدريب" },
    { title: "مدرب يوغا", dept: "التدريب" },
    { title: "مدرب زومبا", dept: "التدريب" },
    { title: "مدير النادي", dept: "الإدارة" },
    { title: "مدير العمليات", dept: "الإدارة" },
    { title: "موظف استقبال", dept: "الاستقبال" },
    { title: "مستشار تغذية", dept: "التغذية" },
    { title: "مسؤول النظافة", dept: "الصيانة" }
  ];
  
  const names = [
    { name: "أحمد محمد", initials: "أم" },
    { name: "سارة العلي", initials: "سع" },
    { name: "ياسر الصالح", initials: "يص" },
    { name: "لينا العمر", initials: "لع" },
    { name: "خالد سعيد", initials: "خس" },
    { name: "فاطمة الفهد", initials: "فف" },
    { name: "عمر حسين", initials: "عح" },
    { name: "سلمى كريم", initials: "سك" },
    { name: "ماجد عبدالله", initials: "مع" },
    { name: "ريم الخالد", initials: "رخ" }
  ];
  
  const shifts = ["صباحي (6ص - 2م)", "مسائي (2م - 10م)"];
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const statuses = ['active', 'active', 'active', 'inactive', 'on_leave'];
  
  const staff: StaffMember[] = [];
  
  for (let i = 0; i < 10; i++) {
    const person = names[i % names.length];
    const role = roles[i % roles.length];
    
    const daysCount = Math.floor(Math.random() * 3) + 3;
    const workDays = [];
    
    for (let j = 0; j < daysCount; j++) {
      const dayIndex = (i + j) % days.length;
      workDays.push(days[dayIndex]);
    }
    
    const hireDate = new Date();
    hireDate.setMonth(hireDate.getMonth() - Math.floor(Math.random() * 24));
    
    staff.push({
      id: `staff-${i}`,
      name: person.name,
      email: person.name.replace(' ', '.').toLowerCase() + '@spartagym.com',
      phone: `05${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      role: role.title,
      department: role.dept,
      hireDate: `${hireDate.getDate()} ${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][hireDate.getMonth()]}، ${hireDate.getFullYear()}`,
      status: statuses[Math.floor(Math.random() * statuses.length)] as 'active' | 'inactive' | 'on_leave',
      schedule: {
        days: workDays,
        shift: shifts[i % 2]
      },
      initials: person.initials
    });
  }
  
  return staff;
};

const initialStaff = generateDummyStaff();

const initialState: StaffState = {
  staff: initialStaff,
  filteredStaff: initialStaff,
  departmentFilter: null,
};

export const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    addStaffMember: (state, action: PayloadAction<StaffMember>) => {
      state.staff.push(action.payload);
      state.filteredStaff = state.departmentFilter 
        ? state.staff.filter(staff => staff.department === state.departmentFilter)
        : [...state.staff];
    },
    updateStaffMember: (state, action: PayloadAction<StaffMember>) => {
      const index = state.staff.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.staff[index] = action.payload;
      }
      state.filteredStaff = state.departmentFilter 
        ? state.staff.filter(staff => staff.department === state.departmentFilter)
        : [...state.staff];
    },
    deleteStaffMember: (state, action: PayloadAction<string>) => {
      state.staff = state.staff.filter(s => s.id !== action.payload);
      state.filteredStaff = state.departmentFilter 
        ? state.staff.filter(staff => staff.department === state.departmentFilter)
        : [...state.staff];
    },
    filterStaffByDepartment: (state, action: PayloadAction<string | null>) => {
      state.departmentFilter = action.payload;
      state.filteredStaff = action.payload
        ? state.staff.filter(staff => staff.department === action.payload)
        : [...state.staff];
    },
    searchStaff: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload.toLowerCase();
      state.filteredStaff = state.staff.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm) ||
        staff.email.toLowerCase().includes(searchTerm) ||
        staff.role.toLowerCase().includes(searchTerm)
      );
    },
  },
});

export const { 
  addStaffMember, 
  updateStaffMember, 
  deleteStaffMember, 
  filterStaffByDepartment,
  searchStaff 
} = staffSlice.actions;
export default staffSlice.reducer;
