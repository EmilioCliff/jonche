import { getPayments } from '@/services/get-payments';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTable } from '@/hooks/UseTable';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function RecentPayments() {
	const { fromDate, toDate } = useTable();

	const { isLoading, error, data } = useQuery({
		queryKey: ['payments', 1, 4, fromDate, toDate, ''],
		queryFn: () => getPayments(1, 4, fromDate, toDate, ''),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	return (
		<div className="space-y-8">
			{data?.data &&
				data.data.map((payment) => {
					const initials = payment.paying_name
						.split(' ')
						.map((n) => n[0])
						.join('')
						.slice(0, 2)
						.toUpperCase();

					const formattedDate = formatPaymentDate(payment.paid_at);

					return (
						<div className="flex items-center" key={payment.id}>
							<Avatar className="h-9 w-9">
								<AvatarFallback>{initials}</AvatarFallback>
							</Avatar>
							<div className="ml-4 space-y-1">
								<p className="text-sm font-medium leading-none">
									{payment.paying_name}
								</p>
								<p className="text-sm text-muted-foreground">
									{formattedDate}
								</p>
							</div>
							<div className="ml-auto font-medium">
								<Badge
									variant="outline"
									className="ml-2 bg-green-50 text-green-700 border-green-200"
								>
									+KES {payment.amount.toFixed(2)}
								</Badge>
							</div>
						</div>
					);
				})}
		</div>
	);
}

function formatPaymentDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();

	const isToday = date.toDateString() === now.toDateString();
	const isYesterday =
		date.toDateString() ===
		new Date(now.setDate(now.getDate() - 1)).toDateString();

	const timeOptions: Intl.DateTimeFormatOptions = {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	};

	if (isToday) {
		return `Today at ${date.toLocaleTimeString('en-US', timeOptions)}`;
	}

	if (isYesterday) {
		return `Yesterday at ${date.toLocaleTimeString('en-US', timeOptions)}`;
	}

	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}
