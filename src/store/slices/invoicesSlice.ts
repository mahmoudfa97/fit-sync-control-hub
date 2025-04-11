
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
  invoices: [
    {
      id: "inv-1",
      memberId: "1",
      memberName: "فراس علي شعبان",
      amount: 500,
      date: "2024-03-15",
      dueDate: "2024-04-15",
      status: "sent",
      items: [
        {
          id: "item-1",
          description: "חברות חודשית",
          quantity: 1,
          unitPrice: 400
        },
        {
          id: "item-2",
          description: "אימון אישי",
          quantity: 2,
          unitPrice: 50
        }
      ]
    },
    {
      id: "inv-2",
      memberId: "2",
      memberName: "יוסי לוי",
      amount: 750,
      date: "2024-03-10",
      dueDate: "2024-04-10",
      status: "paid",
      items: [
        {
          id: "item-1",
          description: "חברות חודשית",
          quantity: 1,
          unitPrice: 500
        },
        {
          id: "item-2",
          description: "ציוד כושר",
          quantity: 1,
          unitPrice: 250
        }
      ]
    },
    {
      id: "inv-3",
      memberId: "3",
      memberName: "מיכל גולדברג",
      amount: 1200,
      date: "2024-02-28",
      dueDate: "2024-03-28",
      status: "overdue",
      items: [
        {
          id: "item-1",
          description: "חברות חצי שנתית",
          quantity: 1,
          unitPrice: 1200
        }
      ]
    }
  ],
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
