
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  type: 'membership' | 'class' | 'product' | 'other';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: 'credit' | 'cash' | 'bank' | 'other';
  invoiceNumber: string;
  notes?: string;
}

interface PaymentsState {
  payments: Payment[];
}

const initialState: PaymentsState = {
  payments: [
    {
      id: "payment-1",
      memberId: "1",
      memberName: "سارة الحمدان",
      amount: 500,
      date: "2024-01-05T08:30:00.000Z",
      type: "membership",
      status: "completed",
      method: "credit",
      invoiceNumber: "INV-2024-001",
    },
    {
      id: "payment-2",
      memberId: "2",
      memberName: "خالد العمري",
      amount: 350,
      date: "2024-02-12T10:15:00.000Z",
      type: "membership",
      status: "completed",
      method: "cash",
      invoiceNumber: "INV-2024-002",
    },
    {
      id: "payment-3",
      memberId: "3",
      memberName: "منى الزهراني",
      amount: 600,
      date: "2023-11-08T14:45:00.000Z",
      type: "membership",
      status: "completed",
      method: "bank",
      invoiceNumber: "INV-2023-112",
    },
    {
      id: "payment-4",
      memberId: "5",
      memberName: "نورة الشمري",
      amount: 750,
      date: "2023-12-03T12:30:00.000Z",
      type: "membership",
      status: "completed",
      method: "credit",
      invoiceNumber: "INV-2023-128",
    },
    {
      id: "payment-5",
      memberId: "6",
      memberName: "محمد العتيبي",
      amount: 200,
      date: "2024-02-18T09:00:00.000Z",
      type: "membership",
      status: "pending",
      method: "bank",
      invoiceNumber: "INV-2024-018",
      notes: "في انتظار تأكيد التحويل البنكي",
    },
  ],
};

export const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.push(action.payload);
    },
    updatePaymentStatus: (state, action: PayloadAction<{id: string, status: Payment['status']}>) => {
      const index = state.payments.findIndex(payment => payment.id === action.payload.id);
      if (index !== -1) {
        state.payments[index].status = action.payload.status;
      }
    },
    refundPayment: (state, action: PayloadAction<string>) => {
      const index = state.payments.findIndex(payment => payment.id === action.payload);
      if (index !== -1) {
        state.payments[index].status = 'refunded';
      }
    },
  },
});

export const { addPayment, updatePaymentStatus, refundPayment } = paymentsSlice.actions;
export default paymentsSlice.reducer;
