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
    name: "سارة الحمدان",
    email: "sarah.alh@example.com",
    membershipType: "بريميوم",
    status: "active",
    joinDate: "5 يناير، 2024",
    lastCheckIn: "اليوم 8:45 ص",
    paymentStatus: "paid",
    initials: "سح",
    membershipEnd: "5 يناير، 2025",
    phone: "050-1234567"
  },
  {
    id: "2",
    name: "خالد العمري",
    email: "khalid.a@example.com",
    membershipType: "قياسي",
    status: "active",
    joinDate: "12 فبراير، 2024",
    lastCheckIn: "اليوم 7:30 ص",
    paymentStatus: "paid",
    initials: "خع",
    membershipEnd: "12 فبراير، 2025",
    phone: "050-7654321"
  },
  {
    id: "3",
    name: "منى الزهراني",
    email: "mona.z@example.com",
    membershipType: "بريميوم",
    status: "active",
    joinDate: "8 نوفمبر، 2023",
    lastCheckIn: "بالأمس 6:15 م",
    paymentStatus: "paid",
    initials: "مز",
    membershipEnd: "8 نوفمبر، 2024",
    phone: "055-1234567"
  },
  {
    id: "4",
    name: "أحمد السعيد",
    email: "ahmed.s@example.com",
    membershipType: "قياسي",
    status: "inactive",
    joinDate: "21 مارس، 2023",
    lastCheckIn: "2 أبريل، 2025",
    paymentStatus: "overdue",
    initials: "أس",
    membershipEnd: "21 مارس، 2024",
    phone: "056-7654321"
  },
  {
    id: "5",
    name: "نورة الشمري",
    email: "noura.s@example.com",
    membershipType: "بريميوم بلس",
    status: "active",
    joinDate: "3 ديسمبر، 2023",
    lastCheckIn: "اليوم 10:20 ص",
    paymentStatus: "paid",
    initials: "نش",
    membershipEnd: "3 ديسمبر، 2024",
    phone: "054-1234567"
  },
  {
    id: "6",
    name: "محمد العتيبي",
    email: "mohammed.o@example.com",
    membershipType: "شهري",
    status: "active",
    joinDate: "18 فبراير، 2024",
    lastCheckIn: "بالأمس 8:00 م",
    paymentStatus: "pending",
    initials: "مع",
    membershipEnd: "18 مارس، 2024",
    phone: "050-9876543"
  },
  {
    id: "7",
    name: "ليلى القاسم",
    email: "layla.q@example.com",
    membershipType: "سنوي",
    status: "expired",
    joinDate: "5 أبريل، 2023",
    lastCheckIn: "20 مارس، 2024",
    paymentStatus: "overdue",
    initials: "لق",
    membershipEnd: "5 أبريل، 2024",
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
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        state.members[index].lastCheckIn = `اليوم ${hours}:${minutes} ${hours >= 12 ? 'م' : 'ص'}`;
      }
      state.filteredMembers = state.members.filter(member => 
        !state.filterStatus || member.status === state.filterStatus
      );
    },
  },
});

export const { addMember, updateMember, deleteMember, filterMembers, recordCheckIn } = membersSlice.actions;
export default membersSlice.reducer;
