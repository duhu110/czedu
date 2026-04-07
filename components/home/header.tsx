"use client";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/home/logo";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/home/mobile-nav";

export const navLinks = [
  {
    label: "申请流程",
    href: "#process",
  },
  {
    label: "案例库",
    href: "#cases",
  },
  {
    label: "常见问题",
    href: "#faq",
  },
];

export function Header() {
  const scrolled = useScroll(10);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-4xl border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out",
        {
          "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-3xl md:shadow":
            scrolled,
        },
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          },
        )}
      >
        <a
          className="rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50"
          href="#"
        >
          <Logo className="h-4" />
        </a>
        <div className="hidden items-center gap-2 md:flex">
          <div>
            {navLinks.map((link) => (
              <Button asChild key={link.label} size="sm" variant="ghost">
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </div>
          <Button asChild size="sm" variant="outline">
            <a href="/application">学生登录</a>
          </Button>
          <Button asChild size="sm">
            <a href="/admin">管理后台</a>
          </Button>
        </div>
        <MobileNav />
      </nav>
    </header>
  );
}
