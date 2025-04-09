
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
  classes: [
    {
      id: "class-1",
      name: "يوغا للمبتدئين",
      trainerId: "trainer-1",
      trainerName: "سارة الأحمد",
      dayOfWeek: "monday",
      startTime: "10:00",
      endTime: "11:00",
      maxCapacity: 15,
      currentEnrollment: 8,
      description: "حصة يوغا مناسبة للمبتدئين ومن لديهم خبرة قليلة.",
      level: "beginner",
      status: "active",
    },
    {
      id: "class-2",
      name: "كارديو مكثف",
      trainerId: "trainer-2",
      trainerName: "أحمد المالكي",
      dayOfWeek: "tuesday",
      startTime: "18:00",
      endTime: "19:00",
      maxCapacity: 20,
      currentEnrollment: 15,
      description: "حصة كارديو عالية الكثافة لحرق السعرات وتحسين اللياقة.",
      level: "intermediate",
      status: "active",
    },
    {
      id: "class-3",
      name: "زومبا",
      trainerId: "trainer-3",
      trainerName: "لينا القحطاني",
      dayOfWeek: "wednesday",
      startTime: "19:00",
      endTime: "20:00",
      maxCapacity: 25,
      currentEnrollment: 22,
      description: "حصة زومبا ممتعة على أنغام موسيقى لاتينية.",
      level: "beginner",
      status: "active",
    },
    {
      id: "class-4",
      name: "تدريب قوة متقدم",
      trainerId: "trainer-2",
      trainerName: "أحمد المالكي",
      dayOfWeek: "thursday",
      startTime: "17:00",
      endTime: "18:30",
      maxCapacity: 12,
      currentEnrollment: 10,
      description: "تدريبات قوة متقدمة باستخدام الأوزان الحرة والأجهزة.",
      level: "advanced",
      status: "active",
    },
    {
      id: "class-5",
      name: "بيلاتس",
      trainerId: "trainer-1",
      trainerName: "سارة الأحمد",
      dayOfWeek: "saturday",
      startTime: "09:00",
      endTime: "10:00",
      maxCapacity: 15,
      currentEnrollment: 7,
      description: "تمارين بيلاتس لتقوية عضلات الجسم وزيادة المرونة.",
      level: "intermediate",
      status: "active",
    },
  ],
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
