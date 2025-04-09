import api from '../API/api';
import { CustomerFormType } from '@/pages/customers/schema';
import { commonresponse } from '@/lib/types';

export const addCustomer = async (data: CustomerFormType) => {
	try {
		const response = await api
			.post<commonresponse>('/customer', data)
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
