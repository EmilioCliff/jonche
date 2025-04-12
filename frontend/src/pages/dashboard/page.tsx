import { DashboardHeader } from '@/components/pages/dashboard/header';
import { DashboardShell } from '@/components/pages/dashboard/shell';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Overview } from '@/components/pages/dashboard/overview';
import { RecentPayments } from '@/components/pages/dashboard/recent-payments';
import { RecentLoans } from '@/components/pages/dashboard/recent-loans';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/get-dashboard-stats';
import DashboardSkeleton from '@/components/pages/dashboard/dashboard-skeleton';

export default function DashboardPage() {
	const { isLoading, error, data } = useQuery({
		queryKey: ['dashboard'],
		queryFn: getDashboardStats,
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	if (isLoading) {
		return <DashboardSkeleton />;
	}

	return (
		<>
			<DashboardShell>
				<DashboardHeader
					heading="Dashboard"
					text="Overview of your customer loans and payments."
				/>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Customers
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{data?.stats.total_customers}
							</div>
							<div className="flex justify-between">
								<p className="text-xs text-muted-foreground">
									Active: {data?.stats.active_customers}
								</p>
								<p className="text-xs text-muted-foreground">
									Active: {data?.stats.inactive_customers}
								</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Payments
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								KES{' '}
								{data?.stats.total_payments_received.toFixed(2)}
							</div>
							<div className="flex justify-between">
								<p className="text-xs text-muted-foreground">
									Assigned: KES{' '}
									{data?.stats.assigned_total.toFixed(2)}
								</p>
								<p className="text-xs text-muted-foreground">
									Unassigned: KES{' '}
									{data?.stats.unassigned_total.toFixed(2)}
								</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total SMS
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{data?.stats.total_sms}
							</div>
							<div className="flex justify-between">
								<p className="text-xs text-muted-foreground">
									Delivered: {data?.stats.sms_delivered}
								</p>
								<p className="text-xs text-muted-foreground">
									Undelivered: {data?.stats.sms_undelivered}
								</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Loans
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{data?.stats.total_loans}
							</div>
							<div className="flex justify-between">
								<p className="text-xs text-muted-foreground">
									Disbursed: KES{' '}
									{data?.stats.total_disbursed.toFixed(2)}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
					<Card className="col-span-4 mt-8">
						<CardHeader>
							<CardTitle>Overview</CardTitle>
						</CardHeader>
						<CardContent className="pl-2">
							<Overview data={data?.overview || []} />
						</CardContent>
					</Card>
					<Card className="col-span-3 mt-8">
						<CardHeader>
							<CardTitle>Recent Payments</CardTitle>
							<CardDescription>
								Latest customer payments received
							</CardDescription>
						</CardHeader>
						<CardContent>
							<RecentPayments />
						</CardContent>
					</Card>
				</div>
				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Recent Loans</CardTitle>
						<CardDescription>
							Latest loans disbursed to customers
						</CardDescription>
					</CardHeader>
					<CardContent>
						<RecentLoans />
					</CardContent>
				</Card>
			</DashboardShell>
		</>
	);
}
