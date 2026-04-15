import { Logo } from "@/components/logo";
import { formatBeijingDate, getBeijingNow } from "@/lib/china-time";

export function Footer() {
  const currentYear = formatBeijingDate(getBeijingNow()).slice(0, 4);

  return (
    <footer className="mx-auto w-full max-w-5xl bottom-1">
      <div className="flex flex-col gap-6 px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-4.5" />
          </div>
        </div>
        <nav>
          <ul className="flex flex-wrap gap-4 font-medium text-muted-foreground text-sm md:gap-6"></ul>
        </nav>
      </div>

      <div className="flex items-center justify-between gap-4 border-t px-4 py-4 text-muted-foreground text-sm md:px-6">
        <p>&copy; {currentYear} 城中区教育局</p>
      </div>
    </footer>
  );
}
