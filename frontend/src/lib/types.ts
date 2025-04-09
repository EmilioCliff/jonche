import { Customer } from '@/pages/customers/schema';
import { DashboardStats } from '@/pages/dashboard/schema';
import { Loan } from '@/pages/loans/schema';
import { Payment } from '@/pages/payments/schema';
import { SMS } from '@/pages/sms/schema';
import { ReactNode } from 'react';

export enum smsStatus {
	DELIVERED = 'DELIVERED',
	UNDELIVERED = 'UNDELIVERED',
}

export interface tableFilterType {
	options: {
		label: string;
		value: string;
	}[];
}

export interface contextWrapperProps {
	children: ReactNode;
}

export interface commonDataResponse {
	id: number;
	name: string;
}

export interface pagination {
	page_size: number;
	current_page: number;
	total_data: number;
	total_pages: number;
}

export interface commonresponse {
	status_code?: string;
	message?: string;
	metadata?: pagination;
	data: any;
}

export interface getCustomerType extends Omit<commonresponse, 'data'> {
	data: Customer[];
}

export interface getSingleCustomerType extends Omit<commonresponse, 'data'> {
	data: Customer;
}

export interface getLoanType extends Omit<commonresponse, 'data'> {
	data: Loan[];
}

export interface getPaymentType extends Omit<commonresponse, 'data'> {
	data: Payment[];
}

export interface getSmsType extends Omit<commonresponse, 'data'> {
	data: SMS[];
}

export interface getDashboardStatsType extends Omit<commonresponse, 'data'> {
	stats: DashboardStats;
	overview: {
		name: string;
		loans: number;
		payments: number;
	}[];
}
