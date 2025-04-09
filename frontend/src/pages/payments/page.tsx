import { DashboardHeader } from '@/components/pages/dashboard/header';
import { DashboardShell } from '@/components/pages/dashboard/shell';
import { PaymentList } from '@/components/pages/payments/payment-list';
import { DateRangePicker } from '@/components/UI/date-range-picker';

export default function PaymentsPage() {
	return (
		<DashboardShell>
			<DashboardHeader
				heading="Payments"
				text="View all customer payment records."
			>
				<DateRangePicker />
			</DashboardHeader>
			<PaymentList />
		</DashboardShell>
	);
}
