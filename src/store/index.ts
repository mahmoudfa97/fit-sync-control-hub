
import { configureStore } from '@reduxjs/toolkit';
import paymentsReducer from './slices/paymentsSlice';
import { membersReducer } from './slices/members';
import checkInsReducer from './slices/checkInsSlice';
import invoicesReducer from './slices/invoicesSlice';
import classesReducer from './slices/classesSlice';
import staffReducer from './slices/staffSlice';
import accessControlReducer from './slices/accessControlSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    payments: paymentsReducer,
    members: membersReducer,
    checkIns: checkInsReducer,
    invoices: invoicesReducer,
    classes: classesReducer,
    staff: staffReducer,
    accessControl: accessControlReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
