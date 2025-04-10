import { useState, useEffect, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
	Search,
} from 'lucide-react';
import { getCustomers } from '@/services/get-customers';
import { useDebounce } from '@/hooks/useDebounce';
import { useTable } from '@/hooks/UseTable';

export function CustomerList() {
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
		queryKey: ['customers', pageIndex, pageSize, filter, debouncedInput],
		queryFn: () => getCustomers(pageIndex, pageSize, debouncedInput),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	useEffect(() => {
		if (data?.metadata) {
			updateTableContext(data.metadata);
		}
	}, [data]);

	const filteredCustomers = useMemo(() => {
		if (!searchQuery) return data?.data;

		const query = searchQuery.toLowerCase();

		return data?.data.filter(
			(customer) =>
				customer.name.toLowerCase().includes(query) ||
				customer.phone_number.toLowerCase().includes(query),
		);
	}, [data?.data, searchQuery]);

	return (
		<div className="space-y-4">
			<div className="flex items-center">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search customers..."
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
							<TableHead>Name</TableHead>
							<TableHead>Phone</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Loaned</TableHead>
							<TableHead className="text-right">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredCustomers ? (
							filteredCustomers.map((customer) => (
								<TableRow key={customer.id}>
									<TableCell className="font-medium">
										<Link
											to={`/customers/${customer.id}?tab=loans`}
											className="hover:underline"
										>
											{`CST${customer.id
												.toString()
												.padStart(3, '0')}`}
										</Link>
									</TableCell>
									<TableCell>
										<Link
											to={`/customers/${customer.id}?tab=loans`}
											className="hover:underline"
										>
											{customer.name}
										</Link>
									</TableCell>
									<TableCell>
										{customer.phone_number}
									</TableCell>
									<TableCell>
										KES {customer.loaned?.toFixed(2)}
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={
												customer.status === true
													? 'bg-green-50 text-green-700 border-green-200'
													: 'bg-gray-100 text-gray-700 border-gray-200'
											}
										>
											{customer.status === true
												? 'Active'
												: 'Inactive'}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													className="h-8 w-8 p-0"
												>
													<span className="sr-only">
														Open menu
													</span>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>
													Actions
												</DropdownMenuLabel>
												<DropdownMenuItem>
													<Link
														to={`/customers/${customer.id}`}
														className="w-full"
													>
														View details
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Link
														to={'/loans'}
														className="w-full"
													>
														New loan
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem>
													<Link
														to={`/sms/new?customer=${customer.id}`}
														className="w-full"
													>
														Send SMS
													</Link>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
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
