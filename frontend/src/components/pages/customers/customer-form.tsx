import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardContent, CardFooter } from '@/components/ui/card';
import { CustomerFormType, customerFormSchema } from '@/pages/customers/schema';
import { toast } from 'react-toastify';
import { addCustomer } from '@/services/add-customer';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CustomerFormProps {
	onFormOpen: (isOpen: boolean) => void;
}

export function CustomerForm({ onFormOpen }: CustomerFormProps) {
	const form = useForm<CustomerFormType>({
		resolver: zodResolver(customerFormSchema),
		defaultValues: {
			name: '',
			phone_number: '',
		},
	});

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: addCustomer,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['customers'] });
			toast.success('Customer Added Successful');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
		onSettled: () => onFormOpen(false),
	});

	function onSubmit(values: CustomerFormType) {
		mutation.mutate(values);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CardContent className="space-y-6 pt-6">
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input
											placeholder="John Doe"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="phone_number"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone Number</FormLabel>
									<FormControl>
										<Input
											placeholder="+1 555-123-4567"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button
						variant="outline"
						onClick={() => onFormOpen(false)}
						type="button"
					>
						Cancel
					</Button>
					<Button type="submit">Save Customer</Button>
				</CardFooter>
			</form>
		</Form>
	);
}
