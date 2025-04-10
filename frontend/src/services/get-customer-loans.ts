import { getLoanType } from '@/lib/types';
import api from '../API/api';

export const getCustomerLoans = async (
	id: number,
	pageNumber: number,
	pageSize: number,
) => {
	try {
		const response = await api
			.get<getLoanType>(
				`/customer/loans/${id}?limit=${pageSize}&page=${pageNumber}`,
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
