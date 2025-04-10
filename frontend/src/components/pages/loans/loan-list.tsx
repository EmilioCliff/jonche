import { useEffect, useMemo, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useTable } from '@/hooks/UseTable';
import { useDebounce } from '@/hooks/useDebounce';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getLoans } from '@/services/get-loans';
import { format } from 'date-fns';

export function LoanList() {
	const [searchQuery, setSearchQuery] = useState('');

	const {
		pageIndex,
		pageSize,
		filter,
		setPageSize,
		setPageIndex,
		updateTableContext,
	} = useTable();

	const debouncedInput = useDebounce({ value: searchQuery, delay: 500 });

	const { isLoading, error, data } = useQuery({
		queryKey: ['loans', pageIndex, pageSize, filter, debouncedInput],
		queryFn: () => getLoans(pageIndex, pageSize, debouncedInput),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	useEffect(() => {
		if (data?.metadata) {
			updateTableContext(data.metadata);
		}
	}, [data]);

	const filteredLoans = useMemo(() => {
		if (!searchQuery) return data?.data;

		const query = searchQuery.toLowerCase();

		return data?.data.filter(
			(loan) =>
				loan.customer_details.name.toLowerCase().includes(query) ||
				// loan.customer_details.phone_number.toLowerCase().includes(query) ||
				loan.description.toLowerCase().includes(query),
		);
	}, [data?.data, searchQuery]);

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search loans..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<div className="rounded-md border">
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
						{filteredLoans &&
						filteredLoans[0].customer_details.name ? (
							filteredLoans.map((loan) => (
								<TableRow key={loan.id}>
									<TableCell className="font-medium">
										{`LN${loan.id
											.toString()
											.padStart(3, '0')}`}
									</TableCell>
									<TableCell>
										{loan.customer_details.name}
									</TableCell>
									<TableCell className="max-w-[200px] truncate whitespace-nowrap overflow-hidden">
										{loan.description}
									</TableCell>
									<TableCell>
										KES{' '}
										{loan.amount && loan.amount.toFixed(2)}
									</TableCell>
									<TableCell>
										{format(loan.created_at, 'PPpp')}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

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
					Page {pageIndex} of {data?.metadata?.total_pages}
				</div>
				<Button
					variant="outline"
					size="sm"
					disabled={data?.metadata?.current_page === 1}
					onClick={() => {
						if (
							data?.metadata?.current_page &&
							data?.metadata?.current_page > 1
						) {
							setPageIndex(data?.metadata?.current_page - 1);
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
						data?.metadata?.current_page ===
						data?.metadata?.total_pages
					}
					onClick={() => {
						if (
							data?.metadata?.current_page &&
							data?.metadata?.current_page <
								data?.metadata?.total_pages
						) {
							setPageIndex(data.metadata.current_page + 1);
						}
					}}
				>
					Next
					<ChevronRight className="h-4 w-4 ml-2" />
				</Button>
			</div>
		</div>
	);
}
