import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
// import Link from 'next/link';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface CustomerSMSProps {
	id: string;
}

export function CustomerSMS({ id }: CustomerSMSProps) {
	// In a real app, you would fetch SMS data based on the customer ID
	const messages = [
		{
			id: 'SMS1001',
			content:
				'Your payment of $250 has been received. Your remaining balance is $550. Thank you!',
			date: 'Jun 21, 2023, 10:46 AM',
			type: 'automated',
			status: 'delivered',
		},
		{
			id: 'SMS1002',
			content:
				'Your payment of $250 has been received. Your remaining balance is $800. Thank you!',
			date: 'May 21, 2023, 11:31 AM',
			type: 'automated',
			status: 'delivered',
		},
		{
			id: 'SMS1003',
			content:
				"Dear customer, we're offering a special discount on early loan repayments this month. Contact us for details.",
			date: 'May 10, 2023, 9:00 AM',
			type: 'manual',
			status: 'delivered',
		},
	];

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>SMS History</CardTitle>
					<CardDescription>
						Messages sent to this customer.
					</CardDescription>
				</div>
				<Button asChild>
					<Link
						to={'/'}
						// href={`/dashboard/sms/new?customer=${id}`}
					>
						<MessageSquarePlus className="mr-2 h-4 w-4" />
						Send New SMS
					</Link>
				</Button>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Message</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{messages.map((message) => (
							<TableRow key={message.id}>
								<TableCell className="font-medium">
									{message.id}
								</TableCell>
								<TableCell className="max-w-xs truncate">
									{message.content}
								</TableCell>
								<TableCell>{message.date}</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className={
											message.type === 'automated'
												? 'bg-blue-50 text-blue-700'
												: 'bg-purple-50 text-purple-700'
										}
									>
										{message.type === 'automated'
											? 'Automated'
											: 'Manual'}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className="bg-green-50 text-green-700"
									>
										{message.status}
									</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
