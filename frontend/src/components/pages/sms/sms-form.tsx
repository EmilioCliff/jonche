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
import { Textarea } from '@/components/ui/textarea';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useSearchParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { SMSFormType, smsFormSchema } from '@/pages/sms/schema';
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { getCustomerList } from '@/components/services/get-customer-list';
import { addSMS } from '@/components/services/add-sms';
import { toast } from 'react-toastify';

export function SMSForm() {
	const [searchParams] = useSearchParams();
	const customerId = searchParams.get('customer');

	const form = useForm<SMSFormType>({
		resolver: zodResolver(smsFormSchema),
		defaultValues: {
			message: '',
			customer_ids: Number(customerId) ? [Number(customerId)] : [],
		},
	});

	useEffect(() => {
		if (customerId) {
			form.setValue('customer_ids', [Number(customerId)]);
		}
	}, [customerId, form]);

	const { data } = useQuery({
		queryKey: ['customers'],
		queryFn: () => getCustomerList(),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: addSMS,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['customers'] });
			toast.success('Customer Added Successful');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	function onSubmit(values: SMSFormType) {
		mutation.mutate(values);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CardContent className="space-y-6 pt-6">
					<FormField
						control={form.control}
						name="customer_ids"
						render={({ field }) => {
							const selectedIds = field.value || [];
							const customers = data?.data || [];

							const allSelected =
								customers.length > 0 &&
								customers.every((c) =>
									selectedIds.includes(c.id),
								);
							const toggleAll = (checked: boolean) => {
								field.onChange(
									checked ? customers.map((c) => c.id) : [],
								);
							};

							const chunkedCustomers = Array.from(
								{ length: Math.ceil(customers.length / 10) },
								(_, i) => customers.slice(i * 10, i * 10 + 10),
							);

							return (
								<FormItem>
									<div className="mb-4">
										<FormLabel className="text-base">
											Select Recipients
										</FormLabel>
										<FormDescription>
											Choose which customers will receive
											this message.
										</FormDescription>
									</div>

									<div className="mb-4">
										<Checkbox
											checked={allSelected}
											onCheckedChange={toggleAll}
											id="select-all"
										/>
										<label
											htmlFor="select-all"
											className="ml-2 text-sm font-medium"
										>
											Select All
										</label>
									</div>

									<div className="flex flex-col space-y-4">
										{chunkedCustomers.map(
											(chunk, chunkIndex) => (
												<div
													key={chunkIndex}
													className="flex space-x-8"
												>
													{[0, 1].map((colIndex) => {
														const columnCustomers =
															chunk.slice(
																colIndex * 5,
																colIndex * 5 +
																	5,
															);
														return (
															<div
																key={colIndex}
																className="flex flex-col space-y-2"
															>
																{columnCustomers.map(
																	(
																		customer,
																	) => (
																		<FormItem
																			key={
																				customer.id
																			}
																			className="flex flex-row items-start space-x-2"
																		>
																			<FormControl>
																				<Checkbox
																					checked={selectedIds.includes(
																						customer.id,
																					)}
																					onCheckedChange={(
																						checked,
																					) => {
																						field.onChange(
																							checked
																								? [
																										...selectedIds,
																										customer.id,
																								  ]
																								: selectedIds.filter(
																										(
																											id,
																										) =>
																											id !==
																											customer.id,
																								  ),
																						);
																					}}
																				/>
																			</FormControl>
																			<FormLabel className="font-normal">
																				{
																					customer.name
																				}{' '}
																				(
																				{
																					customer.phone_number
																				}

																				)
																			</FormLabel>
																		</FormItem>
																	),
																)}
															</div>
														);
													})}
												</div>
											),
										)}
									</div>

									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<FormField
						control={form.control}
						name="message"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Message</FormLabel>
								<FormDescription>{`Available variables: {{.Name}}, {{.PhoneNumber}} and {{.Loaned}}`}</FormDescription>
								<FormControl>
									<Textarea
										placeholder="Type your message here..."
										className="resize-none"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									{field.value.length}/200 characters
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Link
						to={'/sms'}
						className="h-9 px-4 py-2 has-[>svg]:px-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
						type="button"
					>
						Cancel
					</Link>
					<Button className="hover:cursor-pointer" type="submit">
						Send SMS
					</Button>
				</CardFooter>
			</form>
		</Form>
	);
}
