import { z } from 'zod';
import { customerSchema } from '../customers/schema';

export const paymentSchema = z.object({
	id: z.number(),
	transaction_number: z.string(),
	transaction_source: z.string(),
	paying_name: z.string(),
	amount: z.number(),
	assigned: z.boolean(),
	assigned_to: z.number().optional(),
	paid_at: z.string().date('Invalid date string!'),
	customer_details: customerSchema,
});

export type Payment = z.infer<typeof paymentSchema>;

export const paymentFormSchema = z.object({
	transaction_number: z.string(),
	transaction_source: z.string(),
	paying_name: z.string(),
	amount: z.number(),
	assigned_to: z.number(),
	paid_at: z.string().optional(),
});

export type PaymentForm = z.infer<typeof paymentFormSchema>;
