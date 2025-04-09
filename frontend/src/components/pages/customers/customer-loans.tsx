import { useEffect } from 'react';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Loan } from '@/pages/loans/schema';
import { pagination } from '@/lib/types';
import { useTable } from '@/hooks/UseTable';
import { format } from 'date-fns';

interface CustomerLoansProps {
	id: string;
	data: Loan[];
	metadata?: pagination;
}

export function CustomerLoans({ id, data, metadata }: CustomerLoansProps) {
	const {
		pageIndex,
		pageSize,
		setPageSize,
		setPageIndex,
		updateTableContext,
		resetTableState,
	} = useTable();

	useEffect(() => {
		updateTableContext(metadata);
	}, [metadata]);

	// if !data {}

	// In a real app, you would fetch loans data based on the customer ID
	// const loans = [
	// 	{
	// 		id: 'L1001',
	// 		product: 'Smartphone',
	// 		amount: 800,
	// 		date: 'Jun 21, 2023',
	// 		balance: 550,
	// 		status: 'active',
	// 	},
	// 	{
	// 		id: 'L1002',
	// 		product: 'Laptop',
	// 		amount: 1200,
	// 		date: 'May 15, 2023',
	// 		balance: 0,
	// 		status: 'paid',
	// 	},
	// 	{
	// 		id: 'L1003',
	// 		product: 'Television',
	// 		amount: 650,
	// 		date: 'Apr 10, 2023',
	// 		balance: 0,
	// 		status: 'paid',
	// 	},
	// ];

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Loans</CardTitle>
					<CardDescription>
						Products and loans distributed to this customer.
					</CardDescription>
				</div>
				<Button asChild>
					<Link
						to={'/'}
						// href={`/dashboard/loans/new?customer=${id}`}
					>
						<PlusCircle className="mr-2 h-4 w-4" />
						New Loan
					</Link>
				</Button>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Date</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((loan) => (
							<TableRow key={loan.id}>
								<TableCell className="font-medium">
									{`LN${loan.id.toString().padStart(3, '0')}`}
								</TableCell>
								<TableCell>{loan.description}</TableCell>
								<TableCell>
									KES {loan.amount.toFixed(2)}
								</TableCell>
								<TableCell>
									{format(loan.created_at, 'PPP')}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<div className="flex items-center justify-end space-x-2 py-4">
					<div className="flex items-center space-x-2">
						<p className="text-sm font-medium">Rows per page</p>
						<Select
							value={`${pageSize}`}
							onValueChange={(value) => {
								setPageSize(Number(value));
								setPageIndex(1);
							}}
						>
							<SelectTrigger className="h-8 w-[70px]">
								<SelectValue placeholder={pageSize} />
							</SelectTrigger>
							<SelectContent side="top">
								{[2, 10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem
										key={pageSize}
										value={`${pageSize}`}
									>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex w-[100px] items-center justify-center text-sm font-medium">
						Page {pageIndex} of {metadata?.total_pages}
					</div>
					<Button
						variant="outline"
						size="sm"
						disabled={metadata?.current_page === 1}
						onClick={() => {
							if (
								metadata?.current_page &&
								metadata?.current_page > 1
							) {
								setPageIndex(metadata?.current_page - 1);
							}
						}}
					>
						<ChevronLeft className="h-4 w-4 mr-2" />
						Previous
					</Button>

					<Button
						variant="outline"
						size="sm"
						disabled={
							metadata?.current_page === metadata?.total_pages
						}
						onClick={() => {
							if (
								metadata?.current_page &&
								metadata?.current_page < metadata?.total_pages
							) {
								setPageIndex(metadata.current_page + 1);
							}
						}}
					>
						Next
						<ChevronRight className="h-4 w-4 ml-2" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
