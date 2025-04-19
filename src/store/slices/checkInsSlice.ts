
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
  checkIns: [],
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
