import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  memberInitials: string;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'cash' | 'bank' | 'other';
  paymentDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'canceled';
  description: string;
  receiptNumber: string;
  // Old fields kept for backward compatibility
  date?: string;
  type?: 'membership' | 'class' | 'product' | 'other';
  method?: 'credit' | 'cash' | 'bank' | 'other';
  invoiceNumber?: string;
  notes?: string;
}

interface PaymentsState {
  payments: Payment[];
  filteredPayments: Payment[];
  filterStatus: string | null;
}

const initialState: PaymentsState = {
  payments: [
    {
      id: "payment-1",
      memberId: "1",
      memberName: "שרה המדאן",
      memberInitials: "שה",
      amount: 500,
      currency: "₪",
      paymentMethod: "card",
      paymentDate: "5 ינואר, 2024",
      status: "paid",
      description: "דמי מנוי",
      receiptNumber: "REC-1001",
    },
    {
      id: "payment-2",
      memberId: "2",
      memberName: "חאלד עומרי",
      memberInitials: "חע",
      amount: 350,
      currency: "₪",
      paymentMethod: "cash",
      paymentDate: "12 פברואר, 2024",
      status: "paid",
      description: "דמי מנוי",
      receiptNumber: "REC-1002",
    },
    {
      id: "payment-3",
      memberId: "3",
      memberName: "מונה זוהרני",
      memberInitials: "מז",
      amount: 600,
      currency: "₪",
      paymentMethod: "bank",
      paymentDate: "8 נובמבר, 2023",
      status: "paid",
      description: "דמי מנוי",
      receiptNumber: "REC-1003",
    },
    {
      id: "payment-4",
      memberId: "5",
      memberName: "נורה שמרי",
      memberInitials: "נש",
      amount: 750,
      currency: "₪",
      paymentMethod: "card",
      paymentDate: "3 דצמבר, 2023",
      status: "paid",
      description: "דמי מנוי",
      receiptNumber: "REC-1004",
    },
    {
      id: "payment-5",
      memberId: "6",
      memberName: "מוחמד עותיבי",
      memberInitials: "מע",
      amount: 200,
      currency: "₪",
      paymentMethod: "bank",
      paymentDate: "18 פברואר, 2024",
      status: "pending",
      description: "ממתין לאישור העברה בנקאית",
      receiptNumber: "REC-1005",
    },
  ],
  filteredPayments: [],
  filterStatus: null,
};

// Initialize filteredPayments with all payments
const stateWithFilteredPayments = {
  ...initialState,
  filteredPayments: initialState.payments,
};

export const paymentsSlice = createSlice({
  name: 'payments',
  initialState: stateWithFilteredPayments,
  reducers: {
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.push(action.payload);
      // Update filtered payments if no filter is applied
      if (!state.filterStatus) {
        state.filteredPayments = state.payments;
      } else {
        // Apply current filter to include the new payment if it matches
        if (!state.filterStatus || action.payload.status === state.filterStatus) {
          state.filteredPayments.push(action.payload);
        }
      }
    },
    updatePaymentStatus: (state, action: PayloadAction<{id: string, status: Payment['status']}>) => {
      const index = state.payments.findIndex(payment => payment.id === action.payload.id);
      if (index !== -1) {
        state.payments[index].status = action.payload.status;
        // Update filtered payments as well
        state.filteredPayments = state.payments.filter(payment => 
          !state.filterStatus || payment.status === state.filterStatus
        );
      }
    },
    filterPaymentsByMember: (state, action: PayloadAction<string>) => {
      if (action.payload) {
        state.filteredPayments = state.payments.filter(payment => 
          payment.memberName.toLowerCase().includes(action.payload.toLowerCase()) ||
          payment.memberId.includes(action.payload)
        );
      } else {
        state.filteredPayments = state.payments;
      }
    },
    filterPaymentsByStatus: (state, action: PayloadAction<string | null>) => {
      state.filterStatus = action.payload;
      if (action.payload) {
        state.filteredPayments = state.payments.filter(payment => 
          payment.status === action.payload
        );
      } else {
        state.filteredPayments = state.payments;
      }
    },
    refundPayment: (state, action: PayloadAction<string>) => {
      const index = state.payments.findIndex(payment => payment.id === action.payload);
      if (index !== -1) {
        state.payments[index].status = 'canceled';
        // Update filtered payments as well
        state.filteredPayments = state.payments.filter(payment => 
          !state.filterStatus || payment.status === state.filterStatus
        );
      }
    },
  },
});

export const { 
  addPayment, 
  updatePaymentStatus, 
  refundPayment, 
  filterPaymentsByMember, 
  filterPaymentsByStatus 
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
