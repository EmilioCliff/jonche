import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CreditCard, Home, Users, MessageSquare } from 'lucide-react';
import { useTable } from '@/hooks/UseTable';

export function MainNav({ className }: { className?: string }) {
	const location = useLocation();
	const { pathname } = location;
	const { resetTableState } = useTable();

	const links = [
		{
			to: '/',
			label: 'Dashboard',
			icon: <Home className="mr-2 h-4 w-4" />,
		},
		{
			to: '/customers',
			label: 'Customers',
			icon: <Users className="mr-2 h-4 w-4" />,
		},
		{
			to: '/loans',
			label: 'Loans',
			icon: <CreditCard className="mr-2 h-4 w-4" />,
		},
		{
			to: '/sms',
			label: 'SMS',
			icon: <MessageSquare className="mr-2 h-4 w-4" />,
		},
		{
			to: '/payments',
			label: 'Payments',
			icon: <MessageSquare className="mr-2 h-4 w-4" />,
		},
	];

	return (
		<nav
			className={cn(
				'hidden sm:flex items-center space-x-6 text-sm font-medium',
				className,
			)}
		>
			{links.map((link) => (
				<Link
					key={link.to}
					to={link.to}
					onClick={resetTableState}
					className={cn(
						'transition-colors hover:text-primary flex items-center',
						pathname.startsWith(link.to)
							? 'text-primary'
							: 'text-muted-foreground',
					)}
				>
					{link.icon}
					<span>{link.label}</span>
				</Link>
			))}
		</nav>
	);
}
