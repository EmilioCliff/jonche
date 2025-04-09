import { z } from 'zod';

export const dashboardStatsSchema = z.object({
	total_customers: z.number(),
	active_customers: z.number(),
	inactive_customers: z.number(),
	total_loans: z.number(),
	total_disbursed: z.number(),
	total_payments_received: z.number(),
	assigned_total: z.number(),
	unassigned_total: z.number(),
	total_sms: z.number(),
	sms_delivered: z.number(),
	sms_undelivered: z.number(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
