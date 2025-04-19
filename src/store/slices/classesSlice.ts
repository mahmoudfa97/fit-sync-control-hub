
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GymClass {
  id: string;
  name: string;
  trainerId: string;
  trainerName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentEnrollment: number;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'active' | 'cancelled';
}

interface ClassesState {
  classes: GymClass[];
}

const initialState: ClassesState = {
  classes: [],
};

export const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    addClass: (state, action: PayloadAction<GymClass>) => {
      state.classes.push(action.payload);
    },
    updateClass: (state, action: PayloadAction<GymClass>) => {
      const index = state.classes.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.classes[index] = action.payload;
      }
    },
    cancelClass: (state, action: PayloadAction<string>) => {
      const index = state.classes.findIndex(c => c.id === action.payload);
      if (index !== -1) {
        state.classes[index].status = 'cancelled';
      }
    },
    reactivateClass: (state, action: PayloadAction<string>) => {
      const index = state.classes.findIndex(c => c.id === action.payload);
      if (index !== -1) {
        state.classes[index].status = 'active';
      }
    },
    enrollMember: (state, action: PayloadAction<string>) => {
      const index = state.classes.findIndex(c => c.id === action.payload);
      if (index !== -1 && state.classes[index].currentEnrollment < state.classes[index].maxCapacity) {
        state.classes[index].currentEnrollment += 1;
      }
    },
    unenrollMember: (state, action: PayloadAction<string>) => {
      const index = state.classes.findIndex(c => c.id === action.payload);
      if (index !== -1 && state.classes[index].currentEnrollment > 0) {
        state.classes[index].currentEnrollment -= 1;
      }
    },
  },
});

export const { addClass, updateClass, cancelClass, reactivateClass, enrollMember, unenrollMember } = classesSlice.actions;
export default classesSlice.reducer;
