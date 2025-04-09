import { useState } from 'react';
import { DashboardHeader } from '@/components/pages/dashboard/header';
import { DashboardShell } from '@/components/pages/dashboard/shell';
import { CustomerList } from '@/components/pages/customers/customer-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { CustomerForm } from '@/components/pages/customers/customer-form';

export default function CustomersPage() {
	const [formOpen, setFormOpen] = useState(false);

	return (
		<DashboardShell>
			<DashboardHeader
				heading="Customers"
				text="Manage your customer accounts."
			>
				<Dialog open={formOpen} onOpenChange={setFormOpen}>
					<DialogTrigger asChild>
						<Button>
							<PlusCircle className="mr-2 h-4 w-4" />
							New Customer
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-screen-lg max-h-screen overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Add New Customer</DialogTitle>
							<DialogDescription>
								Enter the details for the new customer.
							</DialogDescription>
						</DialogHeader>
						<CustomerForm onFormOpen={setFormOpen} />
					</DialogContent>
				</Dialog>
			</DashboardHeader>
			<CustomerList />
		</DashboardShell>
	);
}
