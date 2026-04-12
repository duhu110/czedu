"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SchoolComboboxProps {
  schools: string[];
  value: string;
  onChange: (school: string) => void;
  recommendedSchool: string | null;
}

export function SchoolCombobox({
  schools,
  value,
  onChange,
  recommendedSchool,
}: SchoolComboboxProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const filteredSchools = useMemo(() => {
    const q = filter.trim();
    const list = q
      ? schools.filter((s) => s.includes(q))
      : schools;

    // 推荐学校排在最前
    if (recommendedSchool && list.includes(recommendedSchool)) {
      return [
        recommendedSchool,
        ...list.filter((s) => s !== recommendedSchool),
      ];
    }
    return list;
  }, [filter, recommendedSchool, schools]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value || "选择目标学校"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="搜索学校..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filteredSchools.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              未找到匹配学校
            </div>
          ) : (
            filteredSchools.map((school) => (
              <button
                key={school}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                  value === school && "bg-accent",
                )}
                onClick={() => {
                  onChange(school);
                  setOpen(false);
                  setFilter("");
                }}
              >
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    value === school ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="flex-1 text-left">{school}</span>
                {school === recommendedSchool && (
                  <Badge variant="secondary" className="text-xs gap-1 px-1.5">
                    <Star className="h-3 w-3" />
                    推荐
                  </Badge>
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
