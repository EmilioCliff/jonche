// import { ModeToggle } from '@/components/mode-toggle';
import { UserNav } from '@/components/UI/user-nav';
import { MainNav } from '@/components/UI/main-nav';

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background">
			<div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
				<MainNav />
				<div className="flex flex-1 items-center justify-end space-x-4">
					<nav className="flex items-center space-x-2">
						{/* <ModeToggle /> */}
						<UserNav />
					</nav>
				</div>
			</div>
		</header>
	);
}
