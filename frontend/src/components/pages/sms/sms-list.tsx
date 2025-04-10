import { useEffect, useMemo, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useTable } from '@/hooks/UseTable';
import { useDebounce } from '@/hooks/useDebounce';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getSMS } from '@/services/get-sms';
import { format } from 'date-fns';

export function SMSList() {
	const [searchQuery, setSearchQuery] = useState('');
	const [typeFilter, setTypeFilter] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');

	const {
		pageIndex,
		pageSize,
		filter,
		setPageSize,
		setPageIndex,
		updateTableContext,
	} = useTable();

	// Mock data
	// const messages = [
	// 	{
	// 		id: 'SMS1001',
	// 		customer: 'John Doe',
	// 		content:
	// 			'Your payment of $250 has been received. Your remaining balance is $550. Thank you!',
	// 		date: 'Jun 21, 2023, 10:46 AM',
	// 		type: 'automated',
	// 		status: 'delivered',
	// 	},
	// 	{
	// 		id: 'SMS1002',
	// 		customer: 'Sarah Adams',
	// 		content:
	// 			'Your payment of $120 has been received. Your remaining balance is $1080. Thank you!',
	// 		date: 'Jun 20, 2023, 3:31 PM',
	// 		type: 'automated',
	// 		status: 'delivered',
	// 	},
	// 	{
	// 		id: 'SMS1003',
	// 		customer: 'Robert Johnson',
	// 		content:
	// 			'Your payment of $350 has been received. Your remaining balance is $300. Thank you!',
	// 		date: 'Jun 19, 2023, 1:16 PM',
	// 		type: 'automated',
	// 		status: 'delivered',
	// 	},
	// 	{
	// 		id: 'SMS1004',
	// 		customer: 'Maria Lopez',
	// 		content:
	// 			'Your payment of $180 has been received. Your remaining balance is $770. Thank you!',
	// 		date: 'Jun 18, 2023, 11:31 AM',
	// 		type: 'automated',
	// 		status: 'delivered',
	// 	},
	// 	{
	// 		id: 'SMS1005',
	// 		customer: 'Multiple Customers',
	// 		content:
	// 			"Dear customer, we're offering a special discount on early loan repayments this month. Contact us for details.",
	// 		date: 'May 10, 2023, 9:00 AM',
	// 		type: 'manual',
	// 		status: 'delivered',
	// 	},
	// ];

	const debouncedInput = useDebounce({ value: searchQuery, delay: 500 });

	const { isLoading, error, data } = useQuery({
		queryKey: ['loans', pageIndex, pageSize, filter, debouncedInput],
		queryFn: () => getSMS(pageIndex, pageSize, debouncedInput),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	useEffect(() => {
		if (data?.metadata) {
			updateTableContext(data.metadata);
		}
	}, [data]);

	const filteredMessages = useMemo(() => {
		return data?.data.filter((message) => {
			const matchesSearch =
				message.customer_details.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				message.message
					.toLowerCase()
					.includes(searchQuery.toLowerCase());

			const matchesType =
				typeFilter === 'all' || message.type === typeFilter;
			const matchesStatus =
				statusFilter === 'all' || message.status === statusFilter;

			return matchesSearch && matchesType && matchesStatus;
		});
	}, [data?.data, searchQuery, typeFilter, statusFilter]);

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search messages..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<Select value={typeFilter} onValueChange={setTypeFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						<SelectItem value="automated">Automated</SelectItem>
						<SelectItem value="manual">Manual</SelectItem>
					</SelectContent>
				</Select>

				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="delivered">Delivered</SelectItem>
						<SelectItem value="undelivered">Undelivered</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead>Message</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredMessages ? (
							filteredMessages.map((message) => (
								<TableRow key={message.id}>
									<TableCell className="font-medium">
										{`SMS${message.id
											.toString()
											.padStart(3, '0')}`}
									</TableCell>
									<TableCell>
										{message.customer_details.name}
									</TableCell>
									<TableCell className="max-w-xs truncate">
										{message.message}
									</TableCell>
									<TableCell>
										{format(message.created_at, 'PPpp')}
									</TableCell>
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
											className={
												message.status === 'delivered'
													? 'bg-green-50 text-green-700'
													: 'bg-yellow-50 text-yellow-700'
											}
											// className="bg-green-50 text-green-700"
										>
											{message.status}
										</Badge>
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
