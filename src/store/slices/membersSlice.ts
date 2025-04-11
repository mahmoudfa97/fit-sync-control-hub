
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Member {
  id: string;
  name: string;
  email: string;
  membershipType: string;
  status: "active" | "inactive" | "pending" | "expired";
  joinDate: string;
  lastCheckIn: string;
  paymentStatus: "paid" | "overdue" | "pending";
  initials: string;
  avatar?: string;
  phone?: string;
  address?: string;
  membershipEnd?: string;
  notes?: string;
}

interface MembersState {
  members: Member[];
  filteredMembers: Member[];
  filterStatus: string | null;
}

const initialMembers: Member[] = [
  {
    id: "1",
    name: "שרה כהן",
    email: "sarah.cohen@example.com",
    membershipType: "פרימיום",
    status: "active",
    joinDate: "5 ינואר, 2024",
    lastCheckIn: "היום 8:45",
    paymentStatus: "paid",
    initials: "שכ",
    membershipEnd: "5 ינואר, 2025",
    phone: "050-1234567"
  },
  {
    id: "2",
    name: "יוסי לוי",
    email: "yossi.levi@example.com",
    membershipType: "רגיל",
    status: "active",
    joinDate: "12 פברואר, 2024",
    lastCheckIn: "היום 7:30",
    paymentStatus: "paid",
    initials: "יל",
    membershipEnd: "12 פברואר, 2025",
    phone: "050-7654321"
  },
  {
    id: "3",
    name: "מיכל גולדברג",
    email: "michal.g@example.com",
    membershipType: "פרימיום",
    status: "active",
    joinDate: "8 נובמבר, 2023",
    lastCheckIn: "אתמול 18:15",
    paymentStatus: "paid",
    initials: "מג",
    membershipEnd: "8 נובמבר, 2024",
    phone: "055-1234567"
  },
  {
    id: "4",
    name: "דוד ישראלי",
    email: "david.i@example.com",
    membershipType: "רגיל",
    status: "inactive",
    joinDate: "21 מרץ, 2023",
    lastCheckIn: "2 אפריל, 2025",
    paymentStatus: "overdue",
    initials: "די",
    membershipEnd: "21 מרץ, 2024",
    phone: "056-7654321"
  },
  {
    id: "5",
    name: "רונית אברהם",
    email: "ronit.a@example.com",
    membershipType: "פרימיום פלוס",
    status: "active",
    joinDate: "3 דצמבר, 2023",
    lastCheckIn: "היום 10:20",
    paymentStatus: "paid",
    initials: "רא",
    membershipEnd: "3 דצמבר, 2024",
    phone: "054-1234567"
  },
  {
    id: "6",
    name: "משה יעקובי",
    email: "moshe.y@example.com",
    membershipType: "חודשי",
    status: "active",
    joinDate: "18 פברואר, 2024",
    lastCheckIn: "אתמול 20:00",
    paymentStatus: "pending",
    initials: "מי",
    membershipEnd: "18 מרץ, 2024",
    phone: "050-9876543"
  },
  {
    id: "7",
    name: "לאה פרידמן",
    email: "leah.f@example.com",
    membershipType: "שנתי",
    status: "expired",
    joinDate: "5 אפריל, 2023",
    lastCheckIn: "20 מרץ, 2024",
    paymentStatus: "overdue",
    initials: "לפ",
    membershipEnd: "5 אפריל, 2024",
    phone: "055-9876543"
  },
];

const initialState: MembersState = {
  members: initialMembers,
  filteredMembers: initialMembers,
  filterStatus: null,
};

export const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    addMember: (state, action: PayloadAction<Member>) => {
      state.members.push(action.payload);
      state.filteredMembers = state.members.filter(member => 
        !state.filterStatus || member.status === state.filterStatus
      );
    },
    updateMember: (state, action: PayloadAction<Member>) => {
      const index = state.members.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
      state.filteredMembers = state.members.filter(member => 
        !state.filterStatus || member.status === state.filterStatus
      );
    },
    deleteMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter(m => m.id !== action.payload);
      state.filteredMembers = state.members.filter(member => 
        !state.filterStatus || member.status === state.filterStatus
      );
    },
    filterMembers: (state, action: PayloadAction<{ status: string | null, searchTerm: string }>) => {
      state.filterStatus = action.payload.status;
      
      state.filteredMembers = state.members.filter(member => {
        const matchesStatus = !action.payload.status || member.status === action.payload.status;
        const matchesSearch = !action.payload.searchTerm || 
                             member.name.toLowerCase().includes(action.payload.searchTerm.toLowerCase()) ||
                             member.email.toLowerCase().includes(action.payload.searchTerm.toLowerCase());
        
        return matchesStatus && matchesSearch;
      });
    },
    recordCheckIn: (state, action: PayloadAction<string>) => {
      const index = state.members.findIndex(m => m.id === action.payload);
      if (index !== -1) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        state.members[index].lastCheckIn = `היום ${hours}:${minutes}`;
      }
      state.filteredMembers = state.members.filter(member => 
        !state.filterStatus || member.status === state.filterStatus
      );
    },
  },
});

export const { addMember, updateMember, deleteMember, filterMembers, recordCheckIn } = membersSlice.actions;
export default membersSlice.reducer;
