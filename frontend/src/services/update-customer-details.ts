import api from '../API/api';
import { commonresponse } from '@/lib/types';
import { CustomerEditFormType } from '@/pages/customers/schema';

export const updateCustomerDetails = async (data: CustomerEditFormType) => {
	try {
		const response = await api
			.patch<commonresponse>(`/customer/${data.id}`, data)
			.then((res) => res.data);

		if (response.message) {
			throw new Error(response.message);
		}

		return response;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message);
		}

		throw new Error(error.message);
	}
};
