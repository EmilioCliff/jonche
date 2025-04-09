// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CreditCard, Home, Users, MessageSquare } from 'lucide-react';
import { useTable } from '@/hooks/UseTable';

export function MainNav() {
	// const pathname = usePathname();
	const location = useLocation();
	const { pathname } = location;
	const { resetTableState } = useTable();

	return (
		<nav className="flex items-center space-x-6 text-sm font-medium">
			<Link
				onClick={resetTableState}
				to="/"
				className={cn(
					'transition-colors hover:text-primary flex items-center',
					pathname === '/' ? 'text-primary' : 'text-muted-foreground',
				)}
			>
				<Home className="mr-2 h-4 w-4" />
				<span>Dashboard</span>
			</Link>
			<Link
				onClick={resetTableState}
				to="/customers"
				className={cn(
					'transition-colors hover:text-primary flex items-center',
					pathname.startsWith('/customers')
						? 'text-primary'
						: 'text-muted-foreground',
				)}
			>
				<Users className="mr-2 h-4 w-4" />
				<span>Customers</span>
			</Link>
			<Link
				onClick={resetTableState}
				to="/loans"
				className={cn(
					'transition-colors hover:text-primary flex items-center',
					pathname.startsWith('/loans')
						? 'text-primary'
						: 'text-muted-foreground',
				)}
			>
				<CreditCard className="mr-2 h-4 w-4" />
				<span>Loans</span>
			</Link>
			<Link
				onClick={resetTableState}
				to="/sms"
				className={cn(
					'transition-colors hover:text-primary flex items-center',
					pathname.startsWith('/sms')
						? 'text-primary'
						: 'text-muted-foreground',
				)}
			>
				<MessageSquare className="mr-2 h-4 w-4" />
				<span>SMS</span>
			</Link>
			<Link
				onClick={resetTableState}
				to="/payments"
				className={cn(
					'transition-colors hover:text-primary flex items-center',
					pathname.startsWith('/payments')
						? 'text-primary'
						: 'text-muted-foreground',
				)}
			>
				<MessageSquare className="mr-2 h-4 w-4" />
				<span>Payments</span>
			</Link>
		</nav>
	);
}
