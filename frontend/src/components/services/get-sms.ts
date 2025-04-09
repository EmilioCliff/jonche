import { getSmsType } from '@/lib/types';
import api from '../API/api';

export const getSMS = async (
	pageNumber: number,
	pageSize: number,
	search: string,
) => {
	try {
		let baseUrl = `/sms?limit=${pageSize}&page=${pageNumber}`;

		if (search) {
			baseUrl = baseUrl + `&search=${encodeURIComponent(search)}`;
		}

		const response = await api
			.get<getSmsType>(baseUrl)
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
