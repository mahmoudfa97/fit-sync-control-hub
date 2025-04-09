
import { configureStore } from '@reduxjs/toolkit';
import membersReducer from './slices/membersSlice';
import checkInsReducer from './slices/checkInsSlice';
import paymentsReducer from './slices/paymentsSlice';
import classesReducer from './slices/classesSlice';
import staffReducer from './slices/staffSlice';
import accessControlReducer from './slices/accessControlSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    members: membersReducer,
    checkIns: checkInsReducer,
    payments: paymentsReducer,
    classes: classesReducer,
    staff: staffReducer,
    accessControl: accessControlReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
