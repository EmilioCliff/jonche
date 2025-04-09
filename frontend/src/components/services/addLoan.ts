import api from '../API/api';
import { LoanFormType } from '@/pages/loans/schema';
import { commonresponse } from '@/lib/types';

export const addLoan = async (data: LoanFormType) => {
	try {
		const response = await api
			.post<commonresponse>('/loan', data)
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
