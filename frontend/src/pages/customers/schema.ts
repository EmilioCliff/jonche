import { z } from 'zod';

export const customerSchema = z.object({
	id: z.number(),
	name: z.string(),
	phone_number: z.string(),
	status: z.boolean().optional(),
	loaned: z.number().optional(),
	created_at: z.string().date('Invalid date string!').optional(),
});

export type Customer = z.infer<typeof customerSchema>;

export const customerFormSchema = z.object({
	name: z.string().min(2, {
		message: 'Name must be at least 2 characters.',
	}),
	phone_number: z.string().min(10, {
		message: 'Phone number must be at least 10 digits.',
	}),
});

export type CustomerFormType = z.infer<typeof customerFormSchema>;

export const customerEditFormSchema = z.object({
	id: z.number(),
	name: z.string().min(2, {
		message: 'Name must be at least 2 characters.',
	}),
	phone_number: z.string().min(10, {
		message: 'Phone number must be at least 10 digits.',
	}),
	status: z.enum(['true', 'false']),
});

export type CustomerEditFormType = z.infer<typeof customerEditFormSchema>;
