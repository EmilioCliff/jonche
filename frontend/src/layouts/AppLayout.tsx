import { Outlet } from 'react-router-dom';
import { SiteHeader } from '@/components/UI/site-header';

function AppLayout() {
	return (
		<>
			<div className="relative flex min-h-screen flex-col">
				<SiteHeader />
				<div className="flex-1">{<Outlet />}</div>
			</div>
		</>
	);
}

export default AppLayout;
