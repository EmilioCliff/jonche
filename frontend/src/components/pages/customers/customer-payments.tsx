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

interface CustomerPaymentsProps {
	id: string;
}

export function CustomerPayments({ id }: CustomerPaymentsProps) {
	// In a real app, you would fetch payment data based on the customer ID
	const payments = [
		{
			id: 'P2001',
			amount: 250,
			date: 'Jun 21, 2023, 10:45 AM',
			method: 'Credit Card',
			loanId: 'L1001',
		},
		{
			id: 'P2002',
			amount: 250,
			date: 'May 21, 2023, 11:30 AM',
			method: 'Mobile Payment',
			loanId: 'L1001',
		},
		{
			id: 'P2003',
			amount: 300,
			date: 'May 15, 2023, 3:15 PM',
			method: 'Bank Transfer',
			loanId: 'L1002',
		},
		{
			id: 'P2004',
			amount: 350,
			date: 'Apr 15, 2023, 2:00 PM',
			method: 'Credit Card',
			loanId: 'L1002',
		},
		{
			id: 'P2005',
			amount: 550,
			date: 'Apr 10, 2023, 9:30 AM',
			method: 'Cash',
			loanId: 'L1003',
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Payment History</CardTitle>
				<CardDescription>
					All payments made by this customer.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Transaction Number</TableHead>
							<TableHead>Transaction Source</TableHead>
							<TableHead>Paying Name</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Date</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{payments.map((payment) => (
							<TableRow key={payment.id}>
								<TableCell className="font-medium">
									{payment.id}
								</TableCell>
								<TableCell>
									${payment.amount.toFixed(2)}
								</TableCell>
								<TableCell>{payment.date}</TableCell>
								<TableCell>{payment.method}</TableCell>
								<TableCell>{payment.loanId}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
