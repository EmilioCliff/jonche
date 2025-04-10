import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getLoans } from '@/services/get-loans';
import { format } from 'date-fns';

export function RecentLoans() {
	const { isLoading, error, data } = useQuery({
		queryKey: ['loans', 1, 6],
		queryFn: () => getLoans(1, 6, ''),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>ID</TableHead>
					<TableHead>Customer Name</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>Amount</TableHead>
					<TableHead>Date</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data?.data && data?.data[0].customer_details.name ? (
					data?.data.map((loan) => (
						<TableRow key={loan.id}>
							<TableCell className="font-medium">
								{`LN${loan.id.toString().padStart(3, '0')}`}
							</TableCell>
							<TableCell>{loan.customer_details.name}</TableCell>
							<TableCell className="max-w-[200px] truncate whitespace-nowrap overflow-hidden">
								{loan.description}
							</TableCell>
							<TableCell>
								KES {loan.amount && loan.amount.toFixed(2)}
							</TableCell>
							<TableCell>
								{format(loan.created_at, 'PPpp')}
							</TableCell>
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={6} className="h-24 text-center">
							No results.
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
