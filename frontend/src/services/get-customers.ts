import { getCustomerType } from '@/lib/types';
import api from '../API/api';

export const getCustomers = async (
	pageNumber: number,
	pageSize: number,
	search: string,
) => {
	try {
		let baseUrl = `/customers?limit=${pageSize}&page=${pageNumber}`;

		if (search) {
			baseUrl = baseUrl + `&search=${encodeURIComponent(search)}`;
		}

		const response = await api
			.get<getCustomerType>(baseUrl)
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
