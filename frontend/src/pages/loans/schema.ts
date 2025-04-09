import { z } from 'zod';
import { customerSchema } from '../customers/schema';

export const loanSchema = z.object({
	id: z.number(),
	customer_id: z.number(),
	description: z.string(),
	amount: z.number(),
	created_at: z.string().date('Invalid date string!'),
	customer_details: customerSchema,
});

export type Loan = z.infer<typeof loanSchema>;

export const loanFormSchema = z.object({
	customer_id: z.number().gt(0, {
		message: 'Please select a customer.',
	}),
	amount: z.number().gt(0, {
		message: 'Amount must be greater than 0.',
	}),
	description: z.string(),
});

export type LoanFormType = z.infer<typeof loanFormSchema>;
