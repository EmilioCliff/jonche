import { getSmsType } from '@/lib/types';
import api from '../API/api';

export const getCustomerSms = async (
	id: number,
	pageNumber: number,
	pageSize: number,
) => {
	try {
		const response = await api
			.get<getSmsType>(
				`/customer/sms/${id}?limit=${pageSize}&page=${pageNumber}`,
			)
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
