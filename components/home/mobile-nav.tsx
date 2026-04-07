import { cn } from "@/lib/utils";
import React from "react";
import { Portal, PortalBackdrop } from "@/components/ui/portal";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/components/home/header";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";

export function MobileNav() {
	const [open, setOpen] = React.useState(false);

	return (
		<div className="md:hidden">
			<Button
				aria-controls="mobile-menu"
				aria-expanded={open}
				aria-label="切换菜单"
				className="md:hidden"
				onClick={() => setOpen(!open)}
				size="icon"
				variant="outline"
			>
				{open ? (
					<HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4.5" />
				) : (
					<HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="size-4.5" />
				)}
			</Button>
			{open && (
				<Portal className="top-14" id="mobile-menu">
					<PortalBackdrop />
					<div
						className={cn(
							"data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
							"size-full p-4"
						)}
						data-slot={open ? "open" : "closed"}
					>
						<div className="grid gap-y-2">
							{navLinks.map((link) => (
								<Button
									asChild
									className="justify-start"
									key={link.label}
									variant="ghost"
								>
									<a href={link.href}>{link.label}</a>
								</Button>
							))}
						</div>
						<div className="mt-12 flex flex-col gap-2">
							<Button asChild className="w-full" variant="outline">
								<a href="/application">学生登录</a>
							</Button>
							<Button asChild className="w-full">
								<a href="/admin">管理后台</a>
							</Button>
						</div>
					</div>
				</Portal>
			)}
		</div>
	);
}
