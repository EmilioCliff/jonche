import { useState } from 'react';
import { DashboardHeader } from '@/components/pages/dashboard/header';
import { DashboardShell } from '@/components/pages/dashboard/shell';
import { LoanList } from '@/components/pages/loans/loan-list';
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
import { LoanForm } from '@/components/pages/loans/loan-form';

export default function LoansPage() {
	const [formOpen, setFormOpen] = useState(false);

	return (
		<DashboardShell>
			<DashboardHeader
				heading="Loans"
				text="Manage product distributions and loans."
			>
				<Dialog open={formOpen} onOpenChange={setFormOpen}>
					<DialogTrigger asChild>
						<Button>
							<PlusCircle className="mr-2 h-4 w-4" />
							New Loan
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-screen-lg max-h-screen overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Add New Loan</DialogTitle>
							<DialogDescription>
								Enter the details for the new loan.
							</DialogDescription>
						</DialogHeader>
						<LoanForm onFormOpen={setFormOpen} />
					</DialogContent>
				</Dialog>
			</DashboardHeader>
			<LoanList />
		</DashboardShell>
	);
}
