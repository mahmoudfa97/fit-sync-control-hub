
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CheckIn {
  id: string;
  memberId: string;
  memberName: string;
  checkInTime: string;
  notes?: string;
}

interface CheckInsState {
  checkIns: CheckIn[];
}

const initialState: CheckInsState = {
  checkIns: [
    {
      id: "checkin-1",
      memberId: "1",
      memberName: "سارة الحمدان",
      checkInTime: "2024-04-09T08:45:00.000Z",
    },
    {
      id: "checkin-2",
      memberId: "2",
      memberName: "خالد العمري",
      checkInTime: "2024-04-09T07:30:00.000Z",
    },
    {
      id: "checkin-3",
      memberId: "3",
      memberName: "منى الزهراني",
      checkInTime: "2024-04-08T18:15:00.000Z",
    },
    {
      id: "checkin-4",
      memberId: "5",
      memberName: "نورة الشمري",
      checkInTime: "2024-04-09T10:20:00.000Z",
    },
    {
      id: "checkin-5",
      memberId: "6",
      memberName: "محمد العتيبي",
      checkInTime: "2024-04-08T20:00:00.000Z",
    },
  ],
};

export const checkInsSlice = createSlice({
  name: 'checkIns',
  initialState,
  reducers: {
    addCheckIn: (state, action: PayloadAction<CheckIn>) => {
      state.checkIns.unshift(action.payload);
    },
    removeCheckIn: (state, action: PayloadAction<string>) => {
      state.checkIns = state.checkIns.filter(checkIn => checkIn.id !== action.payload);
    },
  },
});

export const { addCheckIn, removeCheckIn } = checkInsSlice.actions;
export default checkInsSlice.reducer;
