// import { getDashboardOverviewType } from '@/lib/types';
// import api from '../API/api';

// export const getDashboardOverview = async () => {
// 	try {
// 		const response = await api
// 			.get<getDashboardOverviewType>('/dashboard/overview')
// 			.then((res) => res.data);

// 		if (response.message) {
// 			throw new Error(response.message);
// 		}

// 		return response;
// 	} catch (error: any) {
// 		if (error.response) {
// 			throw new Error(error.response.data.message);
// 		}

// 		throw new Error(error.message);
// 	}
// };
