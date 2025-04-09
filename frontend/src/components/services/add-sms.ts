import api from '../API/api';
import { SMSFormType } from '@/pages/sms/schema';
import { commonresponse } from '@/lib/types';

export const addSMS = async (data: SMSFormType) => {
	try {
		const response = await api
			.post<commonresponse>('/sms', data)
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
