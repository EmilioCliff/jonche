import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import LoginPage from './pages/login/page';
import AppLayout from './layouts/AppLayout';
import CustomersPage from './pages/customers/page';
import DashboardPage from './pages/dashboard/page';
import LoansPage from './pages/loans/page';
import SMSPage from './pages/sms/page';
import NotFound from './components/UI/NotFound';
import SingleCustomerPage from './pages/customers/CustomerPage';
import SMSNew from './pages/sms/SmsNew';
import PaymentsPage from './pages/payments/page';
import { TableContextWrapper } from './context/TableContext';
import { ToastContainer } from 'react-toastify';

const queryClient = new QueryClient();

function App() {
	return (
		<TableContextWrapper>
			<QueryClientProvider client={queryClient}>
				<Router>
					<Routes>
						<Route path="/login" element={<LoginPage />} />
						<Route path="/" element={<AppLayout />}>
							<Route path="" element={<DashboardPage />} />
							<Route
								path="customers"
								element={<CustomersPage />}
							/>
							<Route
								path="customers/:id"
								element={<SingleCustomerPage />}
							/>
							<Route path="payments" element={<PaymentsPage />} />
							<Route path="loans" element={<LoansPage />} />
							<Route path="sms" element={<SMSPage />} />
							<Route path="sms/new" element={<SMSNew />} />
						</Route>
						<Route path="*" element={<NotFound />} />
					</Routes>
				</Router>
				<ToastContainer />
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</TableContextWrapper>
	);
}

export default App;
