import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Customer,
	customerEditFormSchema,
	CustomerEditFormType,
} from '@/pages/customers/schema';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { updateCustomerDetails } from '@/services/update-customer-details';

interface EditCustomerFormProps {
	onFormOpen: (isOpen: boolean) => void;
	customer: Customer;
}

export function EditCustomerForm({
	onFormOpen,
	customer,
}: EditCustomerFormProps) {
	const form = useForm<CustomerEditFormType>({
		resolver: zodResolver(customerEditFormSchema),
		defaultValues: {
			id: customer.id,
			name: customer.name,
			phone_number: customer.phone_number,
			status: customer.status ? 'true' : 'false',
		},
	});

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: updateCustomerDetails,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['customers'] });
			toast.success('Customer Updated Successful');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
		onSettled: () => onFormOpen(false),
	});

	function onSubmit(values: CustomerEditFormType) {
		console.log(values);
		mutation.mutate(values);
	}

	function onError(value: any) {
		console.log(value);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit, onError)}
				className="space-y-4"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="Customer name" {...field} />
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
								<Input placeholder="Phone number" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="status"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Status</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="true">Active</SelectItem>
									<SelectItem value="false">
										Inactive
									</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit">Save Changes</Button>
			</form>
		</Form>
	);
}
