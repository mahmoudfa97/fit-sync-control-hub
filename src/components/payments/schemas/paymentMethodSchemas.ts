
import { z } from "zod";

const cardPaymentMethodSchema = z.object({
  paymentType: z.literal('card'),
  provider: z.enum(['visa', 'mastercard', 'other'], {
    required_error: "יש לבחור ספק כרטיס אשראי",
  }),
  lastFour: z.string().length(4, { message: "יש להזין 4 ספרות אחרונות" }),
  cardHolderName: z.string().min(2, { message: "יש להזין שם בעל הכרטיס" }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, { message: "פורמט לא תקין (MM/YY)" }),
  isDefault: z.boolean().default(false),
});

const otherPaymentMethodSchema = z.object({
  paymentType: z.enum(['bank', 'other']),
  isDefault: z.boolean().default(false),
});

export const paymentMethodSchema = z.discriminatedUnion('paymentType', [
  cardPaymentMethodSchema,
  otherPaymentMethodSchema,
]);

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;
