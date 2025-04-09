import { DashboardHeader } from '@/components/pages/dashboard/header';
import { DashboardShell } from '@/components/pages/dashboard/shell';
import { SMSList } from '@/components/pages/sms/sms-list';
import { Button } from '@/components/ui/button';
// import Link from 'next/link';
import { Link } from 'react-router-dom';
import { MessageSquarePlus } from 'lucide-react';

export default function SMSPage() {
	return (
		<DashboardShell>
			<DashboardHeader
				heading="SMS Messages"
				text="View and send SMS messages to customers."
			>
				<Button asChild>
					<Link
						to={'/sms/new'}
						// href="/dashboard/sms/new"
					>
						<MessageSquarePlus className="mr-2 h-4 w-4" />
						Send New SMS
					</Link>
				</Button>
			</DashboardHeader>
			<SMSList />
		</DashboardShell>
	);
}
