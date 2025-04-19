
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Invoice {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: InvoiceItem[];
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoicesState {
  invoices: Invoice[];
}

const initialState: InvoicesState = {
  invoices: [],
};

export const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoices.push(action.payload);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },
    deleteInvoice: (state, action: PayloadAction<string>) => {
      state.invoices = state.invoices.filter(invoice => invoice.id !== action.payload);
    }
  },
});

export const { addInvoice, updateInvoice, deleteInvoice } = invoicesSlice.actions;
export default invoicesSlice.reducer;
