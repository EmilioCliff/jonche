import { Outlet } from 'react-router-dom';
import { SiteHeader } from '@/components/UI/site-header';

function AppLayout() {
	return (
		<>
			<div className="relative px-4 flex min-h-screen flex-col">
				<SiteHeader />
				<div className="flex-1 md:px-6">{<Outlet />}</div>
			</div>
		</>
	);
}

export default AppLayout;
