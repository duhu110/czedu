import Image from "next/image";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { formatBeijingDate, getBeijingNow } from "@/lib/china-time";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";

const navLinks = [
  { href: "#process", label: "申请流程" },
  { href: "#cases", label: "案例库" },
  { href: "#faq", label: "常见问题" },
  { href: "#", label: "院校匹配" },
  { href: "#", label: "材料清单" },
  { href: "#", label: "转学政策" },
];

const socialLinks = [
  {
    href: "#",
    label: "X",
    icon: <XIcon />,
  },
  {
    href: "#",
    label: "Github",
    icon: <HugeiconsIcon icon={GithubIcon} strokeWidth={2} />,
  },
];

export function Footer() {
  const currentYear = formatBeijingDate(getBeijingNow()).slice(0, 4);

  return (
    <footer className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-6 px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-4.5" />
          </div>
          <div className="flex items-center">
            {socialLinks.map(({ href, label, icon }) => (
              <Button asChild key={label} size="icon-sm" variant="ghost">
                <a aria-label={label} href={href}>
                  {icon}
                </a>
              </Button>
            ))}
          </div>
        </div>
        <nav>
          <ul className="flex flex-wrap gap-4 font-medium text-muted-foreground text-sm md:gap-6">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a className="hover:text-foreground" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex items-center justify-between gap-4 border-t px-4 py-4 text-muted-foreground text-sm md:px-6">
        <p>&copy; {currentYear} CZEDU Transfer</p>

        <p className="inline-flex items-center gap-1">
          <span>Mock template by</span>
          <a
            aria-label="x/twitter"
            className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground hover:underline"
            href={"https://x.com/shabanhr"}
            rel="noreferrer"
            target="_blank"
          >
            <Image
              alt="shaban"
              className="size-4 rounded-full"
              height={16}
              src="https://github.com/shabanhr.png"
              width={16}
            />
            Shaban
          </a>
        </p>
      </div>
    </footer>
  );
}

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="m18.9,1.153h3.682l-8.042,9.189,9.46,12.506h-7.405l-5.804-7.583-6.634,7.583H.469l8.6-9.831L0,1.153h7.593l5.241,6.931,6.065-6.931Zm-1.293,19.494h2.039L6.482,3.239h-2.19l13.314,17.408Z" />
    </svg>
  );
}
