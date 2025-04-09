
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GymClass {
  id: string;
  name: string;
  instructor: string;
  instructorId: string;
  capacity: number;
  enrolled: number;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  location: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  categoryColor: string;
}

interface ClassesState {
  classes: GymClass[];
  filteredClasses: GymClass[];
  dayFilter: string | null;
  instructorFilter: string | null;
}

const generateDummyClasses = (): GymClass[] => {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const classNames = [
    { name: 'يوغا', color: 'bg-purple-100 text-purple-800' },
    { name: 'زومبا', color: 'bg-pink-100 text-pink-800' },
    { name: 'كارديو', color: 'bg-red-100 text-red-800' },
    { name: 'تمارين قوة', color: 'bg-blue-100 text-blue-800' },
    { name: 'بيلاتيس', color: 'bg-green-100 text-green-800' },
    { name: 'تمارين الظهر', color: 'bg-amber-100 text-amber-800' },
    { name: 'CrossFit', color: 'bg-indigo-100 text-indigo-800' },
    { name: 'HIIT', color: 'bg-orange-100 text-orange-800' }
  ];
  
  const instructors = [
    { id: 'ins1', name: 'أحمد محمد' },
    { id: 'ins2', name: 'سارة العلي' },
    { id: 'ins3', name: 'ياسر الصالح' },
    { id: 'ins4', name: 'لينا العمر' }
  ];
  
  const locations = ['قاعة 1', 'قاعة 2', 'قاعة 3', 'قاعة متعددة الأغراض'];
  
  const levels = ['beginner', 'intermediate', 'advanced', 'all'];
  
  const classes: GymClass[] = [];
  
  for (let i = 0; i < 12; i++) {
    const classType = classNames[i % classNames.length];
    const instructor = instructors[i % instructors.length];
    const location = locations[i % locations.length];
    const level = levels[i % levels.length];
    
    const daysCount = Math.floor(Math.random() * 3) + 1;
    const classDays = [];
    
    for (let j = 0; j < daysCount; j++) {
      const dayIndex = (i + j) % days.length;
      classDays.push(days[dayIndex]);
    }
    
    const startHour = 6 + Math.floor(i / 2);
    const endHour = startHour + 1;
    
    classes.push({
      id: `class-${i}`,
      name: classType.name,
      instructor: instructor.name,
      instructorId: instructor.id,
      capacity: (Math.floor(Math.random() * 6) + 5) * 5,
      enrolled: Math.floor(Math.random() * 30) + 5,
      schedule: {
        days: classDays,
        startTime: `${startHour}:00 ${startHour >= 12 ? 'م' : 'ص'}`,
        endTime: `${endHour}:00 ${endHour >= 12 ? 'م' : 'ص'}`,
      },
      location: location,
      description: `حصة ${classType.name} ${level === 'beginner' ? 'للمبتدئين' : (level === 'intermediate' ? 'للمستوى المتوسط' : (level === 'advanced' ? 'للمستوى المتقدم' : 'لجميع المستويات'))}`,
      level: level as 'beginner' | 'intermediate' | 'advanced' | 'all',
      categoryColor: classType.color
    });
  }
  
  return classes;
};

const initialClasses = generateDummyClasses();

const initialState: ClassesState = {
  classes: initialClasses,
  filteredClasses: initialClasses,
  dayFilter: null,
  instructorFilter: null,
};

export const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    addClass: (state, action: PayloadAction<GymClass>) => {
      state.classes.push(action.payload);
      state.filteredClasses = applyClassFilters(state.classes, state.dayFilter, state.instructorFilter);
    },
    updateClass: (state, action: PayloadAction<GymClass>) => {
      const index = state.classes.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.classes[index] = action.payload;
      }
      state.filteredClasses = applyClassFilters(state.classes, state.dayFilter, state.instructorFilter);
    },
    deleteClass: (state, action: PayloadAction<string>) => {
      state.classes = state.classes.filter(c => c.id !== action.payload);
      state.filteredClasses = applyClassFilters(state.classes, state.dayFilter, state.instructorFilter);
    },
    filterClassesByDay: (state, action: PayloadAction<string | null>) => {
      state.dayFilter = action.payload;
      state.filteredClasses = applyClassFilters(state.classes, action.payload, state.instructorFilter);
    },
    filterClassesByInstructor: (state, action: PayloadAction<string | null>) => {
      state.instructorFilter = action.payload;
      state.filteredClasses = applyClassFilters(state.classes, state.dayFilter, action.payload);
    },
  },
});

// Helper function to apply filters
const applyClassFilters = (
  classes: GymClass[], 
  dayFilter: string | null, 
  instructorFilter: string | null
): GymClass[] => {
  return classes.filter(cls => {
    const matchesDay = !dayFilter || cls.schedule.days.includes(dayFilter);
    const matchesInstructor = !instructorFilter || 
                             cls.instructorId === instructorFilter || 
                             cls.instructor.includes(instructorFilter);
    
    return matchesDay && matchesInstructor;
  });
};

export const { addClass, updateClass, deleteClass, filterClassesByDay, filterClassesByInstructor } = classesSlice.actions;
export default classesSlice.reducer;
