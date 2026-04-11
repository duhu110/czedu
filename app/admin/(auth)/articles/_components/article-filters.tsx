"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface ArticleFiltersProps {
  categories: Category[];
}

export function ArticleFilters({ categories }: ArticleFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    router.push(pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4 shadow-sm">
      <div className="relative w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索文章标题..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && updateFilters({ search })}
        />
      </div>

      <Select
        defaultValue={searchParams.get("status") || "ALL"}
        onValueChange={(v) =>
          updateFilters({ status: v === "ALL" ? undefined : v })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="文章状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">全部状态</SelectItem>
          <SelectItem value="DRAFT">草稿</SelectItem>
          <SelectItem value="PUBLISHED">已发布</SelectItem>
          <SelectItem value="ARCHIVED">已归档</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("categoryId") || "ALL"}
        onValueChange={(v) =>
          updateFilters({ categoryId: v === "ALL" ? undefined : v })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="文章分类" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">全部分类</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={() => updateFilters({ search })} size="sm">
        筛选
      </Button>

      <Button variant="ghost" size="sm" onClick={handleReset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        重置
      </Button>
    </div>
  );
}
