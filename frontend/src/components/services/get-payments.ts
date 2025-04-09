import { getPaymentType } from '@/lib/types';
import api from '../API/api';

export const getPayments = async (
	pageNumber: number,
	pageSize: number,
	from: string,
	to: string,
	search: string,
) => {
	try {
		let baseUrl = `/payments?limit=${pageSize}&page=${pageNumber}`;
		baseUrl = baseUrl + `&from=${encodeURIComponent(from)}`;
		baseUrl = baseUrl + `&to=${encodeURIComponent(to)}`;

		if (search) {
			baseUrl = baseUrl + `&search=${encodeURIComponent(search)}`;
		}

		const response = await api
			.get<getPaymentType>(baseUrl)
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
