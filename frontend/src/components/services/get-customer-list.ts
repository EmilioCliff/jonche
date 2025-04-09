import { getCustomerType } from '@/lib/types';
import api from '../API/api';

export const getCustomerList = async () => {
	try {
		const response = await api
			.get<getCustomerType>('/helper/customer')
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
