import { DashboardHeader } from '@/components/pages/dashboard/header';
import { DashboardShell } from '@/components/pages/dashboard/shell';
import { SMSForm } from '@/components/pages/sms/sms-form';
import { Card } from '@/components/ui/card';

export default function SMSNew() {
	return (
		<DashboardShell>
			<DashboardHeader
				heading="Send SMS"
				text="Send SMS messages to one or multiple customers."
			/>
			<Card>
				<SMSForm />
			</Card>
		</DashboardShell>
	);
}
