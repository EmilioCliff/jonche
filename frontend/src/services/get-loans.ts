import { getLoanType } from '@/lib/types';
import api from '../API/api';

export const getLoans = async (
	pageNumber: number,
	pageSize: number,
	search: string,
) => {
	try {
		let baseUrl = `/loans?limit=${pageSize}&page=${pageNumber}`;

		if (search) {
			baseUrl = baseUrl + `&search=${encodeURIComponent(search)}`;
		}

		const response = await api
			.get<getLoanType>(baseUrl)
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
