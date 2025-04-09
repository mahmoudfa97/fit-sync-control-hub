
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CheckIn {
  id: string;
  memberId: string;
  memberName: string;
  memberInitials: string;
  memberAvatar?: string;
  timestamp: string;
  date: string;
  time: string;
}

interface CheckInsState {
  checkIns: CheckIn[];
  filteredCheckIns: CheckIn[];
  dateFilter: string | null;
}

// Generate dummy check-ins for the past week
const generateDummyCheckIns = (): CheckIn[] => {
  const checkIns: CheckIn[] = [];
  const memberNames = [
    { id: "1", name: "سارة الحمدان", initials: "سح" },
    { id: "2", name: "خالد العمري", initials: "خع" },
    { id: "3", name: "منى الزهراني", initials: "مز" },
    { id: "5", name: "نورة الشمري", initials: "نش" },
    { id: "6", name: "محمد العتيبي", initials: "مع" }
  ];

  const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const today = new Date();
  
  // Generate check-ins for the past 7 days
  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setDate(today.getDate() - i);
    const dayName = dayNames[day.getDay()];
    const dateStr = `${dayName}، ${day.getDate()} ${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][day.getMonth()]}`;
    
    // Each day will have 5-10 check-ins
    const numCheckIns = Math.floor(Math.random() * 6) + 5;
    
    for (let j = 0; j < numCheckIns; j++) {
      const member = memberNames[Math.floor(Math.random() * memberNames.length)];
      const hour = Math.floor(Math.random() * 14) + 6; // Between 6am and 8pm
      const minute = Math.floor(Math.random() * 60);
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'م' : 'ص'}`;
      
      checkIns.push({
        id: `checkin-${i}-${j}`,
        memberId: member.id,
        memberName: member.name,
        memberInitials: member.initials,
        timestamp: new Date(day.setHours(hour, minute)).toISOString(),
        date: dateStr,
        time: time
      });
    }
  }
  
  return checkIns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const initialCheckIns = generateDummyCheckIns();

const initialState: CheckInsState = {
  checkIns: initialCheckIns,
  filteredCheckIns: initialCheckIns,
  dateFilter: null,
};

export const checkInsSlice = createSlice({
  name: 'checkIns',
  initialState,
  reducers: {
    addCheckIn: (state, action: PayloadAction<CheckIn>) => {
      state.checkIns.unshift(action.payload);
      state.filteredCheckIns = state.dateFilter 
        ? state.checkIns.filter(checkIn => checkIn.date === state.dateFilter)
        : [...state.checkIns];
    },
    filterCheckInsByDate: (state, action: PayloadAction<string | null>) => {
      state.dateFilter = action.payload;
      state.filteredCheckIns = action.payload
        ? state.checkIns.filter(checkIn => checkIn.date === action.payload)
        : [...state.checkIns];
    },
    filterCheckInsByMember: (state, action: PayloadAction<string>) => {
      state.filteredCheckIns = state.checkIns.filter(checkIn => 
        checkIn.memberName.toLowerCase().includes(action.payload.toLowerCase()) ||
        checkIn.memberId === action.payload
      );
    },
  },
});

export const { addCheckIn, filterCheckInsByDate, filterCheckInsByMember } = checkInsSlice.actions;
export default checkInsSlice.reducer;
