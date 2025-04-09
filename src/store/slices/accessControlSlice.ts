
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
  accessCards: [
    {
      id: "card-1",
      memberId: "1",
      cardNumber: "AC10001",
      accessLevel: "premium",
      isActive: true,
      issueDate: "2024-01-05T08:00:00.000Z",
    },
    {
      id: "card-2",
      memberId: "2",
      cardNumber: "AC10002",
      accessLevel: "standard",
      isActive: true,
      issueDate: "2024-02-12T09:30:00.000Z",
    },
    {
      id: "card-3",
      memberId: "3",
      cardNumber: "AC10003",
      accessLevel: "premium",
      isActive: true,
      issueDate: "2023-11-08T10:15:00.000Z",
    },
    {
      id: "card-4",
      memberId: "4",
      cardNumber: "AC10004",
      accessLevel: "standard",
      isActive: false,
      issueDate: "2023-03-21T14:00:00.000Z",
      revokeDate: "2024-03-21T12:00:00.000Z",
    },
    {
      id: "card-5",
      memberId: "5",
      cardNumber: "AC10005",
      accessLevel: "vip",
      isActive: true,
      issueDate: "2023-12-03T11:45:00.000Z",
    },
  ],
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
