
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AccessCard {
  id: string;
  memberId: string;
  cardNumber: string;
  accessLevel: 'standard' | 'premium' | 'vip' | 'staff';
  isActive: boolean;
  issueDate: string;
  revokeDate?: string;
}

interface AccessControlState {
  accessCards: AccessCard[];
}

const initialState: AccessControlState = {
  accessCards: [],
};

export const accessControlSlice = createSlice({
  name: 'accessControl',
  initialState,
  reducers: {
    addAccessCard: (state, action: PayloadAction<AccessCard>) => {
      state.accessCards.push(action.payload);
    },
    revokeAccess: (state, action: PayloadAction<string>) => {
      const cardIndex = state.accessCards.findIndex(card => card.id === action.payload);
      if (cardIndex !== -1) {
        state.accessCards[cardIndex].isActive = false;
        state.accessCards[cardIndex].revokeDate = new Date().toISOString();
      }
    },
    reactivateAccess: (state, action: PayloadAction<string>) => {
      const cardIndex = state.accessCards.findIndex(card => card.id === action.payload);
      if (cardIndex !== -1) {
        state.accessCards[cardIndex].isActive = true;
        delete state.accessCards[cardIndex].revokeDate;
      }
    },
  },
});

export const { addAccessCard, revokeAccess, reactivateAccess } = accessControlSlice.actions;
export default accessControlSlice.reducer;
