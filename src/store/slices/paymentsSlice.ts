
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
  dueDate?: string;
  status: 'paid' | 'pending' | 'overdue' | 'canceled';
  description: string;
  receiptNumber?: string;
}

interface PaymentsState {
  payments: Payment[];
  filteredPayments: Payment[];
  statusFilter: string | null;
}

const generateDummyPayments = (): Payment[] => {
  const members = [
    { id: "1", name: "سارة الحمدان", initials: "سح" },
    { id: "2", name: "خالد العمري", initials: "خع" },
    { id: "3", name: "منى الزهراني", initials: "مز" },
    { id: "4", name: "أحمد السعيد", initials: "أس" },
    { id: "5", name: "نورة الشمري", initials: "نش" },
    { id: "6", name: "محمد العتيبي", initials: "مع" },
    { id: "7", name: "ليلى القاسم", initials: "لق" },
  ];

  const paymentDescriptions = [
    "اشتراك سنوي",
    "اشتراك شهري",
    "رسوم تجديد",
    "رسوم تسجيل",
    "خدمات إضافية"
  ];

  const payments: Payment[] = [];
  
  // Past payments
  for (let i = 0; i < 15; i++) {
    const member = members[Math.floor(Math.random() * members.length)];
    const isPremium = Math.random() > 0.5;
    const amount = isPremium ? Math.floor(Math.random() * 2000) + 3000 : Math.floor(Math.random() * 1000) + 200;
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    
    const paymentStatus = i < 12 ? 'paid' : (i < 14 ? 'pending' : 'overdue');
    
    payments.push({
      id: `payment-${i}`,
      memberId: member.id,
      memberName: member.name,
      memberInitials: member.initials,
      amount: amount,
      currency: 'ريال',
      paymentMethod: i % 3 === 0 ? 'cash' : (i % 3 === 1 ? 'card' : 'bank'),
      paymentDate: `${date.getDate()} ${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][date.getMonth()]}، ${date.getFullYear()}`,
      status: paymentStatus,
      description: paymentDescriptions[Math.floor(Math.random() * paymentDescriptions.length)],
      receiptNumber: `REC-${1000 + i}`
    });
  }
  
  return payments;
};

const initialPayments = generateDummyPayments();

const initialState: PaymentsState = {
  payments: initialPayments,
  filteredPayments: initialPayments,
  statusFilter: null,
};

export const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.unshift(action.payload);
      state.filteredPayments = state.statusFilter 
        ? state.payments.filter(payment => payment.status === state.statusFilter)
        : [...state.payments];
    },
    updatePayment: (state, action: PayloadAction<Payment>) => {
      const index = state.payments.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
      state.filteredPayments = state.statusFilter 
        ? state.payments.filter(payment => payment.status === state.statusFilter)
        : [...state.payments];
    },
    filterPaymentsByStatus: (state, action: PayloadAction<string | null>) => {
      state.statusFilter = action.payload;
      state.filteredPayments = action.payload
        ? state.payments.filter(payment => payment.status === action.payload)
        : [...state.payments];
    },
    filterPaymentsByMember: (state, action: PayloadAction<string>) => {
      state.filteredPayments = state.payments.filter(payment => 
        payment.memberName.toLowerCase().includes(action.payload.toLowerCase()) ||
        payment.memberId === action.payload
      );
    },
  },
});

export const { addPayment, updatePayment, filterPaymentsByStatus, filterPaymentsByMember } = paymentsSlice.actions;
export default paymentsSlice.reducer;
