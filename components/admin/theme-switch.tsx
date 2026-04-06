"use client";

import { MoonStarIcon, SunMediumIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";

export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-2">
      <SunMediumIcon className="size-4 text-muted-foreground" />
      <Switch
        aria-label={isDark ? "切换浅色模式" : "切换深色模式"}
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <MoonStarIcon className="size-4 text-muted-foreground" />
    </div>
  );
}
