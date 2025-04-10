import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { DashboardHeader } from '@/components/pages/dashboard/header';
import { DashboardShell } from '@/components/pages/dashboard/shell';
import { CustomerDetails } from '@/components/pages/customers/customer-details';
import { CustomerLoans } from '@/components/pages/customers/customer-loans';
import { CustomerPayments } from '@/components/pages/customers/customer-payments';
import { CustomerSMS } from '@/components/pages/customers/customer-sms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Edit,
	MessageSquare,
	MessageSquarePlus,
	PlusCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTable } from '@/hooks/UseTable';
import { getCustomer } from '@/services/get-customer';
import { getCustomerLoans } from '@/services/get-customer-loans';
import { getCustomerPayments } from '@/services/get-customer-payments';
import { getCustomerSms } from '@/services/get-customer-sms';
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { EditCustomerForm } from '@/components/pages/customers/customer-edit';

export default function SingleCustomerPage() {
	let params = useParams<string>();
	const [searchParams, setSearchParams] = useSearchParams();
	const [formOpen, setFormOpen] = useState(false);
	const tab = searchParams.get('tab') ?? 'loans';

	const {
		pageIndex,
		pageSize,
		setPageSize,
		setPageIndex,
		updateTableContext,
		resetTableState,
	} = useTable();

	const customerDetailsQuery = useQuery({
		queryKey: ['customers', params.id],
		queryFn: () => getCustomer(Number(params.id)),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	const customerLoansQuery = useQuery({
		queryKey: ['customers', params.id, 'loans', pageIndex, pageSize],
		queryFn: () => getCustomerLoans(Number(params.id), pageIndex, pageSize),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
		enabled: tab === 'loans',
	});

	const customerPaymentsQuery = useQuery({
		queryKey: ['customers', params.id, 'payments', pageIndex, pageSize],
		queryFn: () =>
			getCustomerPayments(Number(params.id), pageIndex, pageSize),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
		enabled: tab === 'payments',
	});

	const customerSmsQuery = useQuery({
		queryKey: ['customers', params.id, 'sms', pageIndex, pageSize],
		queryFn: () => getCustomerSms(Number(params.id), pageIndex, pageSize),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
		enabled: tab === 'sms',
	});

	useEffect(() => {
		resetTableState();
	}, [tab]);

	return (
		<DashboardShell>
			<DashboardHeader
				heading="Customer Details"
				text={`Manage customer ID: ${params.id}`}
			>
				<Button variant="outline" onClick={resetTableState} asChild>
					<Link to={'/customers'}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Customers
					</Link>
				</Button>
			</DashboardHeader>

			<Card>
				<CardHeader className="flex flex-row items-start justify-between">
					<div>
						<CardTitle className="text-2xl">
							{customerDetailsQuery.data?.data.name}
						</CardTitle>
						<CardDescription>
							Customer since{' '}
							{customerDetailsQuery.data?.data.created_at &&
								format(
									customerDetailsQuery.data?.data.created_at,
									'PPP',
								)}
						</CardDescription>
					</div>
					<div className="flex space-x-2">
						<Button variant="outline" size="sm" asChild>
							<Link
								to={`/sms/new?customer=${customerDetailsQuery.data?.data.id}`}
							>
								<MessageSquare className="mr-2 h-4 w-4" />
								Send SMS
							</Link>
						</Button>
						<Dialog open={formOpen} onOpenChange={setFormOpen}>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm">
									<Edit className="mr-2 h-4 w-4" />
									Edit
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Edit Customer</DialogTitle>
									<DialogDescription>
										Update the customer's details below.
									</DialogDescription>
								</DialogHeader>

								{customerDetailsQuery.data?.data ? (
									<EditCustomerForm
										onFormOpen={setFormOpen}
										customer={
											customerDetailsQuery.data.data
										}
									/>
								) : (
									<p className="text-sm text-muted-foreground">
										Loading customer data...
									</p>
								)}
							</DialogContent>
						</Dialog>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">
								Contact Information
							</h3>
							<div className="mt-2 space-y-2">
								<p className="text-sm">
									<span className="font-medium">Name:</span>{' '}
									{customerDetailsQuery.data?.data.name}
								</p>
								<p className="text-sm">
									<span className="font-medium">Phone:</span>{' '}
									{
										customerDetailsQuery.data?.data
											.phone_number
									}
								</p>
								<p className="text-sm">
									<span className="font-medium">
										Address:
									</span>{' '}
									Nairobi, Kenya
								</p>
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">
								Account Information
							</h3>
							<div className="mt-2 space-y-2">
								<p className="text-sm">
									<span className="font-medium">
										Customer ID:
									</span>{' '}
									{`CST${customerDetailsQuery.data?.data.id
										.toString()
										.padStart(3, '0')}`}
								</p>
								<p className="text-sm">
									<span className="font-medium">Loaned:</span>{' '}
									KES{' '}
									{customerDetailsQuery.data?.data.loaned &&
										customerDetailsQuery.data?.data.loaned.toFixed(
											2,
										)}
								</p>
								<p className="text-sm">
									<span className="font-medium">Status:</span>{' '}
									<Badge
										variant="outline"
										className={
											customerDetailsQuery.data?.data
												.status === true
												? 'bg-green-50 text-green-700 border-green-200'
												: 'bg-gray-100 text-gray-700 border-gray-200'
										}
									>
										{customerDetailsQuery.data?.data
											.status === true
											? 'Active'
											: 'Inactive'}
									</Badge>
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Tabs
				defaultValue="loans"
				className="mt-6"
				onValueChange={(value) => {
					setSearchParams({ tab: value });
				}}
			>
				<TabsList>
					<TabsTrigger value="loans">Loans</TabsTrigger>
					<TabsTrigger value="payments">Payments</TabsTrigger>
					<TabsTrigger value="sms">SMS History</TabsTrigger>
				</TabsList>
				<TabsContent value="loans" className="mt-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Loans</CardTitle>
								<CardDescription>
									Products and loans distributed to this
									customer.
								</CardDescription>
							</div>
							<Button asChild>
								<Link
									to={`/loans?customer=${customerDetailsQuery.data?.data.id}`}
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
									{(customerLoansQuery.data?.data?.length ??
										0) > 0 ? (
										customerLoansQuery?.data?.data.map(
											(loan) => (
												<TableRow key={loan.id}>
													<TableCell className="font-medium">
														{`LN${loan.id
															.toString()
															.padStart(3, '0')}`}
													</TableCell>
													<TableCell>
														{loan.description}
													</TableCell>
													<TableCell>
														KES{' '}
														{loan.amount.toFixed(2)}
													</TableCell>
													<TableCell>
														{format(
															loan.created_at,
															'PPpp',
														)}
													</TableCell>
												</TableRow>
											),
										)
									) : (
										<TableRow>
											<TableCell
												colSpan={6}
												className="h-24 text-center text-lg"
											>
												No results
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
							<div className="flex items-center justify-end space-x-2 py-4">
								<div className="flex items-center space-x-2">
									<p className="text-sm font-medium">
										Rows per page
									</p>
									<Select
										value={`${pageSize}`}
										onValueChange={(value) => {
											setPageSize(Number(value));
											setPageIndex(1);
										}}
									>
										<SelectTrigger className="h-8 w-[70px]">
											<SelectValue
												placeholder={pageSize}
											/>
										</SelectTrigger>
										<SelectContent side="top">
											{[2, 10, 20, 30, 40, 50].map(
												(pageSize) => (
													<SelectItem
														key={pageSize}
														value={`${pageSize}`}
													>
														{pageSize}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
								</div>
								<div className="flex w-[100px] items-center justify-center text-sm font-medium">
									Page {pageIndex} of{' '}
									{
										customerLoansQuery?.data?.metadata
											?.total_pages
									}
								</div>
								<Button
									variant="outline"
									size="sm"
									disabled={
										customerLoansQuery?.data?.metadata
											?.current_page === 1
									}
									onClick={() => {
										if (
											customerLoansQuery?.data?.metadata
												?.current_page &&
											customerLoansQuery?.data?.metadata
												?.current_page > 1
										) {
											setPageIndex(
												customerLoansQuery?.data
													?.metadata?.current_page -
													1,
											);
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
										customerLoansQuery?.data?.metadata
											?.current_page ===
										customerLoansQuery?.data?.metadata
											?.total_pages
									}
									onClick={() => {
										if (
											customerLoansQuery?.data?.metadata
												?.current_page &&
											customerLoansQuery?.data?.metadata
												?.current_page <
												customerLoansQuery?.data
													?.metadata?.total_pages
										) {
											setPageIndex(
												customerLoansQuery?.data
													?.metadata.current_page + 1,
											);
										}
									}}
								>
									Next
									<ChevronRight className="h-4 w-4 ml-2" />
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="payments" className="mt-4">
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
										<TableHead>
											Transaction Number
										</TableHead>
										<TableHead>Paying Name</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>
											Transaction Source
										</TableHead>
										<TableHead>Date</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{(customerPaymentsQuery.data?.data
										?.length ?? 0) > 0 ? (
										customerPaymentsQuery.data?.data.map(
											(payment) => (
												<TableRow key={payment.id}>
													<TableCell className="font-medium">
														{`PMT${payment.id
															.toString()
															.padStart(3, '0')}`}
													</TableCell>
													<TableCell>
														{
															payment.transaction_number
														}
													</TableCell>
													<TableCell>
														{payment.paying_name}
													</TableCell>
													<TableCell>
														$
														{payment.amount.toFixed(
															2,
														)}
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
															{
																payment.transaction_source
															}
														</Badge>
													</TableCell>
													<TableCell>
														{format(
															payment.paid_at,
															'PPpp',
														)}
													</TableCell>
												</TableRow>
											),
										)
									) : (
										<TableRow>
											<TableCell
												colSpan={6}
												className="h-24 text-center text-lg"
											>
												No results
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
							<div className="flex items-center justify-end space-x-2 py-4">
								<div className="flex items-center space-x-2">
									<p className="text-sm font-medium">
										Rows per page
									</p>
									<Select
										value={`${pageSize}`}
										onValueChange={(value) => {
											setPageSize(Number(value));
											setPageIndex(1);
										}}
									>
										<SelectTrigger className="h-8 w-[70px]">
											<SelectValue
												placeholder={pageSize}
											/>
										</SelectTrigger>
										<SelectContent side="top">
											{[2, 10, 20, 30, 40, 50].map(
												(pageSize) => (
													<SelectItem
														key={pageSize}
														value={`${pageSize}`}
													>
														{pageSize}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
								</div>
								<div className="flex w-[100px] items-center justify-center text-sm font-medium">
									Page {pageIndex} of{' '}
									{
										customerPaymentsQuery?.data?.metadata
											?.total_pages
									}
								</div>
								<Button
									variant="outline"
									size="sm"
									disabled={
										customerPaymentsQuery?.data?.metadata
											?.current_page === 1
									}
									onClick={() => {
										if (
											customerPaymentsQuery?.data
												?.metadata?.current_page &&
											customerPaymentsQuery?.data
												?.metadata?.current_page > 1
										) {
											setPageIndex(
												customerPaymentsQuery?.data
													?.metadata?.current_page -
													1,
											);
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
										customerPaymentsQuery?.data?.metadata
											?.current_page ===
										customerPaymentsQuery?.data?.metadata
											?.total_pages
									}
									onClick={() => {
										if (
											customerPaymentsQuery?.data
												?.metadata?.current_page &&
											customerPaymentsQuery?.data
												?.metadata?.current_page <
												customerPaymentsQuery?.data
													?.metadata?.total_pages
										) {
											setPageIndex(
												customerPaymentsQuery?.data
													?.metadata.current_page + 1,
											);
										}
									}}
								>
									Next
									<ChevronRight className="h-4 w-4 ml-2" />
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="sms" className="mt-4">
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
									to={`/sms/new?customer=${customerDetailsQuery.data?.data.id}`}
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
									{(customerSmsQuery.data?.data?.length ??
										0) > 0 ? (
										customerSmsQuery.data?.data.map(
											(sms) => (
												<TableRow key={sms.id}>
													<TableCell className="font-medium">
														{`SMS${sms.id
															.toString()
															.padStart(3, '0')}`}
													</TableCell>
													<TableCell>
														{sms.message}
													</TableCell>
													<TableCell>
														{format(
															sms.created_at,
															'PPpp',
														)}
													</TableCell>
													<TableCell>
														<Badge
															variant="outline"
															className={
																sms.type ===
																'automated'
																	? 'bg-blue-50 text-blue-700'
																	: 'bg-purple-50 text-purple-700'
															}
														>
															{sms.type ===
															'automated'
																? 'Automated'
																: 'Manual'}
														</Badge>
													</TableCell>
													<TableCell>
														<Badge
															variant="outline"
															className="bg-green-50 text-green-700"
														>
															{sms.status}
														</Badge>
													</TableCell>
												</TableRow>
											),
										)
									) : (
										<TableRow>
											<TableCell
												colSpan={6}
												className="h-24 text-center text-lg"
											>
												No results
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
							<div className="flex items-center justify-end space-x-2 py-4">
								<div className="flex items-center space-x-2">
									<p className="text-sm font-medium">
										Rows per page
									</p>
									<Select
										value={`${pageSize}`}
										onValueChange={(value) => {
											setPageSize(Number(value));
											setPageIndex(1);
										}}
									>
										<SelectTrigger className="h-8 w-[70px]">
											<SelectValue
												placeholder={pageSize}
											/>
										</SelectTrigger>
										<SelectContent side="top">
											{[2, 10, 20, 30, 40, 50].map(
												(pageSize) => (
													<SelectItem
														key={pageSize}
														value={`${pageSize}`}
													>
														{pageSize}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
								</div>
								<div className="flex w-[100px] items-center justify-center text-sm font-medium">
									Page {pageIndex} of{' '}
									{
										customerSmsQuery?.data?.metadata
											?.total_pages
									}
								</div>
								<Button
									variant="outline"
									size="sm"
									disabled={
										customerSmsQuery?.data?.metadata
											?.current_page === 1
									}
									onClick={() => {
										if (
											customerSmsQuery?.data?.metadata
												?.current_page &&
											customerSmsQuery?.data?.metadata
												?.current_page > 1
										) {
											setPageIndex(
												customerSmsQuery?.data?.metadata
													?.current_page - 1,
											);
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
										customerSmsQuery?.data?.metadata
											?.current_page ===
										customerSmsQuery?.data?.metadata
											?.total_pages
									}
									onClick={() => {
										if (
											customerSmsQuery?.data?.metadata
												?.current_page &&
											customerSmsQuery?.data?.metadata
												?.current_page <
												customerSmsQuery?.data?.metadata
													?.total_pages
										) {
											setPageIndex(
												customerSmsQuery?.data?.metadata
													.current_page + 1,
											);
										}
									}}
								>
									Next
									<ChevronRight className="h-4 w-4 ml-2" />
								</Button>
							</div>
						</CardContent>
					</Card>
					{/* <CustomerSMS id={params.id || ''} /> */}
				</TabsContent>
			</Tabs>
		</DashboardShell>
	);
}
