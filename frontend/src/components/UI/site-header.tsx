import { Menu } from 'lucide-react';
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { useState } from 'react';

export function SiteHeader() {
	const [sheetOpen, setSheetOpen] = useState(false);

	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background">
			<div className="container flex h-16 items-center justify-between">
				<div className="sm:hidden">
					<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon">
								<Menu className="h-6 w-6" />
							</Button>
						</SheetTrigger>
						<SheetTitle className="hidden"></SheetTitle>
						<SheetContent
							aria-describedby={undefined}
							className="p-0"
							side="left"
						>
							<div className="h-full p-6 flex flex-col">
								<h2 className="text-xl font-bold mb-6">
									Jonche Credits
								</h2>
								<MainNav className="pt-6 flex h-full items-start flex-col space-y-10" />
							</div>
						</SheetContent>
					</Sheet>
				</div>

				<MainNav />

				<div className="flex items-center space-x-2">
					<UserNav />
				</div>
			</div>
		</header>
	);
}
