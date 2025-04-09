// import { getDashboardOverview } from '@/components/services/get-dashboard-overview';
// import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
	Bar,
	BarChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip,
} from 'recharts';

// const data = [
// 	{
// 		name: 'Jan',
// 		loans: 4000,
// 		payments: 2400,
// 	},
// 	{
// 		name: 'Feb',
// 		loans: 3000,
// 		payments: 1398,
// 	},
// 	{
// 		name: 'Mar',
// 		loans: 2000,
// 		payments: 3800,
// 	},
// 	{
// 		name: 'Apr',
// 		loans: 2780,
// 		payments: 3908,
// 	},
// 	{
// 		name: 'May',
// 		loans: 1890,
// 		payments: 4800,
// 	},
// 	{
// 		name: 'Jun',
// 		loans: 2390,
// 		payments: 3800,
// 	},
// ];

interface OverviewProps {
	data: {
		name: string;
		loans: number;
		payments: number;
	}[];
}

export function Overview(data: OverviewProps) {
	// const { isLoading, error, data } = useQuery({
	// 	queryKey: ['dashboard'],
	// 	queryFn: getDashboardOverview,
	// 	staleTime: 5 * 1000,
	// 	placeholderData: keepPreviousData,
	// });

	return (
		<ResponsiveContainer width="100%" height={350}>
			<BarChart data={data?.data}>
				<XAxis
					dataKey="name"
					stroke="#888888"
					fontSize={12}
					tickLine={false}
					axisLine={false}
				/>
				<YAxis
					stroke="#888888"
					fontSize={12}
					tickLine={false}
					axisLine={false}
					tickFormatter={(value) => `$${value}`}
				/>
				<Tooltip />
				<Bar dataKey="loans" fill="#adfa1d" radius={[4, 4, 0, 0]} />
				<Bar dataKey="payments" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	);
}
