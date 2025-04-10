import api from '../API/api';
import { commonresponse } from '@/lib/types';

export const assignPayment = async ({
	paymentId,
	customerId,
}: {
	paymentId: number;
	customerId: number;
}) => {
	try {
		const response = await api
			.patch<commonresponse>(
				`/payment/${paymentId}?customerId=${customerId}`,
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
