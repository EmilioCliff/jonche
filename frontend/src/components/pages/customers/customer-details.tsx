import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, MessageSquare } from 'lucide-react';
// import Link from 'next/link';
import { Link } from 'react-router-dom';

interface CustomerDetailsProps {
	id: string;
}

export function CustomerDetails({ id }: CustomerDetailsProps) {
	// In a real app, you would fetch customer data based on the ID
	const customer = {
		id,
		name: 'John Doe',
		email: 'john@example.com',
		phone: '+1 555-123-4567',
		address: '123 Main St, Anytown, CA 12345',
		balance: 550,
		status: 'active',
		joinDate: 'Jan 15, 2023',
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between">
				<div>
					<CardTitle className="text-2xl">{customer.name}</CardTitle>
					<CardDescription>
						Customer since {customer.joinDate}
					</CardDescription>
				</div>
				<div className="flex space-x-2">
					<Button variant="outline" size="sm" asChild>
						<Link
							to={'/'}
							// href={`/dashboard/sms/new?customer=${id}`}
						>
							<MessageSquare className="mr-2 h-4 w-4" />
							Send SMS
						</Link>
					</Button>
					<Button variant="outline" size="sm">
						<Edit className="mr-2 h-4 w-4" />
						Edit
					</Button>
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
								<span className="font-medium">Email:</span>{' '}
								{customer.email}
							</p>
							<p className="text-sm">
								<span className="font-medium">Phone:</span>{' '}
								{customer.phone}
							</p>
							<p className="text-sm">
								<span className="font-medium">Address:</span>{' '}
								{customer.address}
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
								{customer.id}
							</p>
							<p className="text-sm">
								<span className="font-medium">Balance:</span> $
								{customer.balance.toFixed(2)}
							</p>
							<p className="text-sm">
								<span className="font-medium">Status:</span>{' '}
								<Badge
									variant="outline"
									className={
										customer.status === 'active'
											? 'bg-green-50 text-green-700 border-green-200'
											: 'bg-gray-100 text-gray-700 border-gray-200'
									}
								>
									{customer.status === 'active'
										? 'Active'
										: 'Inactive'}
								</Badge>
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
