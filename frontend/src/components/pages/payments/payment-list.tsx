import { useEffect, useMemo, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
	PlusCircle,
	Search,
} from 'lucide-react';
import { useTable } from '@/hooks/UseTable';
import { useDebounce } from '@/hooks/useDebounce';
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { getPayments } from '@/services/get-payments';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getCustomerList } from '@/services/get-customer-list';
import { assignPayment } from '@/services/assign-payment';
import { toast } from 'react-toastify';
import { Label } from 'recharts';

export function PaymentList() {
	const [activeViewPaymentId, setActiveViewPaymentId] = useState<
		number | null
	>(null);
	const [activeAssignPaymentId, setActiveAssignPaymentId] = useState<
		number | null
	>(null);
	const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
		null,
	);
	const [searchQuery, setSearchQuery] = useState('');
	const [sourceFilter, setSourceFilter] = useState('all');
	const [assignedFilter, setAssignedFilter] = useState('all');

	const {
		pageIndex,
		pageSize,
		filter,
		fromDate,
		toDate,
		setPageSize,
		setPageIndex,
		updateTableContext,
	} = useTable();

	const debouncedInput = useDebounce({ value: searchQuery, delay: 500 });

	const { isLoading, error, data } = useQuery({
		queryKey: [
			'payments',
			pageIndex,
			pageSize,
			fromDate,
			toDate,
			filter,
			debouncedInput,
		],
		queryFn: () =>
			getPayments(pageIndex, pageSize, fromDate, toDate, debouncedInput),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	useEffect(() => {
		if (data?.metadata) {
			updateTableContext(data.metadata);
		}
	}, [data]);

	const customerListQuery = useQuery({
		queryKey: ['customers'],
		queryFn: () => getCustomerList(),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
		enabled: activeAssignPaymentId !== null,
	});

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: assignPayment,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['customers'] });
			toast.success('Customer Added Successful');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
		onSettled: () => {
			setSelectedCustomerId(null);
			setActiveAssignPaymentId(null);
		},
	});

	function onSubmit({
		paymentId,
		customerId,
	}: {
		paymentId: number;
		customerId: number;
	}) {
		mutation.mutate({ paymentId, customerId });
	}

	const filteredPayments = useMemo(() => {
		return data?.data.filter((payment) => {
			const matchesSearch =
				payment.transaction_number
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				payment.paying_name
					.toLowerCase()
					.includes(searchQuery.toLowerCase());

			const matchesSource =
				sourceFilter === 'all' ||
				payment.transaction_source === sourceFilter;

			const matchesAssigned =
				assignedFilter === 'all' ||
				(assignedFilter === 'assigned' && payment.assigned) ||
				(assignedFilter === 'unassigned' && !payment.assigned);

			return matchesSearch && matchesSource && matchesAssigned;
		});
	}, [data?.data, searchQuery, sourceFilter, assignedFilter]);

	return (
		<div className="space-y-4">
			<div className="flex gap-2 items-center">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search payments..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				<Select value={sourceFilter} onValueChange={setSourceFilter}>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Filter by source" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Sources</SelectItem>
						<SelectItem value="MPESA">Mpesa</SelectItem>
						<SelectItem value="INTERNAL">Internal</SelectItem>
					</SelectContent>
				</Select>

				<Select
					value={assignedFilter}
					onValueChange={setAssignedFilter}
				>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Assigned status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="assigned">Assigned</SelectItem>
						<SelectItem value="unassigned">Unassigned</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Transaction Number</TableHead>
							<TableHead>Transaction Source</TableHead>
							<TableHead>Paying Name</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Assigned</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredPayments ? (
							filteredPayments.map((payment) => (
								<TableRow key={payment.id}>
									<TableCell className="font-medium">
										{`PM${payment.id
											.toString()
											.padStart(3, '0')}`}
									</TableCell>
									<TableCell>
										{payment.transaction_number}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												payment.transaction_source ===
												'INTERNAL'
													? 'default'
													: 'secondary'
											}
										>
											{payment.transaction_source}
										</Badge>
									</TableCell>
									<TableCell>{payment.paying_name}</TableCell>
									<TableCell>
										KES {payment.amount.toFixed(2)}
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={
												payment.assigned === true
													? 'bg-green-50 text-green-700 border-green-200'
													: 'bg-gray-100 text-gray-700 border-gray-200'
											}
										>
											{payment.assigned === true
												? 'YES'
												: 'NO'}
										</Badge>
									</TableCell>
									<TableCell>
										{format(payment.paid_at, 'PPpp')}
									</TableCell>
									<TableCell>
										<div className="flex gap-4">
											<Dialog
												open={
													activeViewPaymentId ===
													payment.id
												}
												onOpenChange={(open) =>
													setActiveViewPaymentId(
														open
															? payment.id
															: null,
													)
												}
											>
												<DialogTrigger asChild>
													<Button
														variant="outline"
														className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
													>
														View Details
													</Button>
												</DialogTrigger>
												{/* <DialogTrigger asChild>
												<Button
													variant="outline"
													className="justify-start"
												>
													View Details
												</Button>
											</DialogTrigger> */}
												<DialogContent className="max-w-screen-md max-h-screen overflow-y-auto">
													<DialogHeader>
														<DialogTitle>
															Payment Details –{' '}
															{`LN${payment.id
																.toString()
																.padStart(
																	3,
																	'0',
																)}`}
														</DialogTitle>
														<DialogDescription>
															Below are the
															details for this
															payment record.
														</DialogDescription>
													</DialogHeader>

													<div className="space-y-4 text-sm text-gray-700">
														<div>
															<strong>
																Transaction
																Number:
															</strong>{' '}
															{
																payment.transaction_number
															}
														</div>
														<div>
															<strong>
																Paying Name:
															</strong>{' '}
															{
																payment.paying_name
															}
														</div>
														<div>
															<strong>
																Amount:
															</strong>{' '}
															KES{' '}
															{payment.amount.toLocaleString()}
														</div>
														<div>
															<strong>
																Source:
															</strong>{' '}
															{
																payment.transaction_source
															}
														</div>
														<div>
															<strong>
																Paid At:
															</strong>{' '}
															{new Date(
																payment.paid_at,
															).toLocaleString()}
														</div>
														<div>
															<strong>
																Status:
															</strong>{' '}
															<span
																className={
																	payment.assigned
																		? 'text-green-600 font-medium'
																		: 'text-red-600 font-medium'
																}
															>
																{payment.assigned
																	? 'Assigned'
																	: 'Unassigned'}
															</span>
														</div>

														{payment.assigned &&
															payment.customer_details && (
																<div className="mt-6 border-t pt-4">
																	<h4 className="text-base font-semibold text-gray-800 mb-2">
																		Assigned
																		To:
																	</h4>
																	<div>
																		<strong>
																			Name:
																		</strong>{' '}
																		{
																			payment
																				.customer_details
																				.name
																		}
																	</div>
																	<div>
																		<strong>
																			Phone
																			Number:
																		</strong>{' '}
																		{
																			payment
																				.customer_details
																				.phone_number
																		}
																	</div>
																	<div>
																		<strong>
																			Customer
																			ID:
																		</strong>{' '}
																		{
																			payment
																				.customer_details
																				.id
																		}
																	</div>
																</div>
															)}
													</div>
												</DialogContent>
											</Dialog>
											{!payment.assigned && (
												<Dialog
													open={
														activeAssignPaymentId ===
														payment.id
													}
													onOpenChange={(open) =>
														setActiveAssignPaymentId(
															open
																? payment.id
																: null,
														)
													}
												>
													<DialogTrigger asChild>
														<Button
															variant="outline"
															className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
														>
															Assign
														</Button>
													</DialogTrigger>
													<DialogContent className="max-w-md">
														<DialogHeader>
															<DialogTitle>
																Assign Payment
															</DialogTitle>
															<DialogDescription>
																Choose a
																customer to
																assign this
																payment.
															</DialogDescription>
														</DialogHeader>

														{customerListQuery.isLoading ? (
															<div className="text-sm text-muted-foreground">
																Loading
																customers...
															</div>
														) : (
															<div className="space-y-4">
																<Label>
																	Select
																	Customer
																</Label>
																<Select
																	value={
																		selectedCustomerId?.toString() ??
																		''
																	}
																	onValueChange={(
																		val,
																	) =>
																		setSelectedCustomerId(
																			Number(
																				val,
																			),
																		)
																	}
																>
																	<SelectTrigger id="customer">
																		<SelectValue placeholder="Choose a customer..." />
																	</SelectTrigger>
																	<SelectContent>
																		{customerListQuery.data?.data?.map(
																			(
																				customer,
																			) => (
																				<SelectItem
																					key={
																						customer.id
																					}
																					value={customer.id.toString()}
																				>
																					{
																						customer.name
																					}{' '}
																					(
																					{
																						customer.phone_number
																					}

																					)
																				</SelectItem>
																			),
																		)}
																	</SelectContent>
																</Select>

																{/* Assign Button */}
																<Button
																	type="button"
																	disabled={
																		!selectedCustomerId ||
																		mutation.isPending
																	}
																	onClick={() =>
																		onSubmit(
																			{
																				paymentId:
																					payment.id,
																				customerId:
																					selectedCustomerId!,
																			},
																		)
																	}
																>
																	{mutation.isPending
																		? 'Assigning...'
																		: 'Assign'}
																</Button>
															</div>
														)}
													</DialogContent>
												</Dialog>
											)}
										</div>
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
