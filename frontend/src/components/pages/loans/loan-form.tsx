import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CardContent, CardFooter } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { LoanFormType, loanFormSchema } from '@/pages/loans/schema';
import {
	useQuery,
	useMutation,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { addLoan } from '@/components/services/addLoan';
import { getCustomerList } from '@/components/services/get-customer-list';

interface LoanFormProps {
	onFormOpen: (isOpen: boolean) => void;
}

export function LoanForm({ onFormOpen }: LoanFormProps) {
	const form = useForm<LoanFormType>({
		resolver: zodResolver(loanFormSchema),
		defaultValues: {
			customer_id: 0,
			description: '',
			amount: 0,
		},
	});

	const { data } = useQuery({
		queryKey: ['customers'],
		queryFn: () => getCustomerList(),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: addLoan,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['customers'] });
			toast.success('Customer Added Successful');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
		onSettled: () => onFormOpen(false),
	});

	function onSubmit(values: LoanFormType) {
		mutation.mutate(values);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CardContent className="space-y-6 pt-6">
					<FormField
						control={form.control}
						name="customer_id"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Customer</FormLabel>
								<Select
									// Only pass value when there's a selected customer
									onValueChange={(val) =>
										field.onChange(Number(val))
									}
									value={
										field.value
											? String(field.value)
											: undefined
									}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select customer" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{data?.data.map((customer) => (
											<SelectItem
												key={customer.id}
												value={String(customer.id)}
											>
												{customer.name} -{' '}
												{customer.phone_number}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
					{/* <FormField
						control={form.control}
						name="customer_id"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Customer</FormLabel>
								<Select
									onValueChange={(val) =>
										field.onChange(Number(val))
									} 
									defaultValue={String(field.value)} 
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select customer" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{data?.data.map((customer) => (
											<SelectItem
												key={customer.id}
												value={String(customer.id)} 
											>
												{customer.name} -{' '}
												{customer.phone_number}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/> */}
					<FormField
						control={form.control}
						name="amount"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Amount</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="0"
										value={field.value}
										onChange={(e) =>
											field.onChange(
												Number(e.target.value),
											)
										}
									/>
								</FormControl>
								<FormDescription>
									The total amount of the loan.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Additional details about the loan"
										className="resize-none"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Optional description of the product or loan
									terms.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button
						variant="outline"
						onClick={() => onFormOpen(false)}
						type="button"
					>
						Cancel
					</Button>
					<Button type="submit">Create Loan</Button>
				</CardFooter>
			</form>
		</Form>
	);
}
