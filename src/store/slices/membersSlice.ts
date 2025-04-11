import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  initials: string;
  membershipType: string;
  joinDate: string;
  membershipEndDate?: string;
  status: 'active' | 'inactive' | 'pending' | 'expired';
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'canceled';
  notes?: string;
  lastCheckIn?: string;
  address?: string;
  emergencyContact?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}

interface MembersState {
  members: Member[];
  filteredMembers: Member[];
  searchQuery: string;
  filterStatus: string | null;
}

const initialMembers: Member[] = [
  {
    id: "1",
    name: "فراس علي شعبان",
    email: "firas@example.com",
    phone: "050-1234567",
    initials: "فع",
    membershipType: "שנתי",
    joinDate: "10 ינואר, 2023",
    membershipEndDate: "2025-01-10",
    status: "active",
    paymentStatus: "paid",
    lastCheckIn: "היום, 09:45",
    address: "רחוב הזית 15, חיפה",
    emergencyContact: "עלי שעבאן: 052-7654321",
    birthDate: "1985-06-12",
    gender: "male"
  },
  {
    id: "2",
    name: "יוסי לוי",
    email: "yossi@example.com",
    phone: "054-7654321",
    initials: "יל",
    membershipType: "חודשי",
    joinDate: "5 מרץ, 2024",
    membershipEndDate: "2024-05-05",
    status: "active",
    paymentStatus: "paid",
    lastCheckIn: "אתמול, 18:30",
    address: "רחוב הרצל 42, תל אביב",
    emergencyContact: "שרה לוי: 050-1234567",
    birthDate: "1990-03-15",
    gender: "male"
  },
  {
    id: "3",
    name: "מיכל גולדברג",
    email: "michal@example.com",
    phone: "052-9876543",
    initials: "מג",
    membershipType: "חצי שנתי",
    joinDate: "15 אפריל, 2023",
    membershipEndDate: "2024-04-25",
    status: "active",
    paymentStatus: "overdue",
    lastCheckIn: "לפני 3 ימים, 12:15",
    address: "רחוב יפו 8, ירושלים",
    emergencyContact: "דוד גולדברג: 053-6543210",
    birthDate: "1988-09-20",
    gender: "female"
  },
  {
    id: "4",
    name: "דוד ישראלי",
    email: "david.i@example.com",
    phone: "056-7654321",
    initials: "די",
    membershipType: "רגיל",
    joinDate: "21 מרץ, 2023",
    membershipEndDate: "2024-03-21",
    status: "inactive",
    paymentStatus: "overdue",
    lastCheckIn: "2 אפריל, 2025",
    address: "רחוב הדר 10, רמת גן",
    emergencyContact: "רוני ישראלי: 052-1234567",
    birthDate: "1980-07-14",
    gender: "male"
  },
  {
    id: "5",
    name: "רונית אברהם",
    email: "ronit.a@example.com",
    phone: "054-1234567",
    initials: "רא",
    membershipType: "פרימיום פלוס",
    joinDate: "3 דצמבר, 2023",
    membershipEndDate: "2024-12-03",
    status: "active",
    paymentStatus: "paid",
    lastCheckIn: "היום 10:20",
    address: "רחוב הדר 10, רמת גן",
    emergencyContact: "רוני ישראלי: 052-1234567",
    birthDate: "1980-07-14",
    gender: "male"
  },
  {
    id: "6",
    name: "משה יעקובי",
    email: "moshe.y@example.com",
    phone: "050-9876543",
    initials: "מי",
    membershipType: "חודשי",
    joinDate: "18 פברואר, 2024",
    membershipEndDate: "2024-02-18",
    status: "active",
    paymentStatus: "pending",
    lastCheckIn: "אתמול 20:00",
    address: "רחוב הדר 10, רמת גן",
    emergencyContact: "רוני ישראלי: 052-1234567",
    birthDate: "1980-07-14",
    gender: "male"
  },
  {
    id: "7",
    name: "לאה פרידמן",
    email: "leah.f@example.com",
    phone: "055-9876543",
    initials: "לפ",
    membershipType: "שנתי",
    joinDate: "5 אפריל, 2023",
    membershipEndDate: "2024-04-05",
    status: "expired",
    paymentStatus: "overdue",
    lastCheckIn: "20 מרץ, 2024",
    address: "רחוב הדר 10, רמת גן",
    emergencyContact: "רוני ישראלי: 052-1234567",
    birthDate: "1980-07-14",
    gender: "male"
  },
];

const initialState: MembersState = {
  members: initialMembers,
  filteredMembers: [],
  searchQuery: '',
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
