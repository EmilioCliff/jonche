import { z } from 'zod';
import { customerSchema } from '../customers/schema';

export const smsSchema = z.object({
	id: z.number(),
	customer_id: z.number(),
	message: z.string(),
	type: z.string(),
	status: z.string(),
	created_at: z.string().date('Invalid date string!'),
	customer_details: customerSchema,
});

export type SMS = z.infer<typeof smsSchema>;

export const smsFormSchema = z.object({
	message: z.string().min(5, {
		message: 'Message must be at least 5 characters.',
	}),
	customer_ids: z.number().array().min(1, {
		message: 'Please select at least one customer.',
	}),
});

export type SMSFormType = z.infer<typeof smsFormSchema>;
