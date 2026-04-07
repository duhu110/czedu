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

export function ApplicationFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  // 更新 URL 参数的通用函数
  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    // 每次筛选都重置回第一页
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
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border shadow-sm">
      <div className="relative w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索姓名或身份证号..."
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
          <SelectValue placeholder="审核状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">全部状态</SelectItem>
          <SelectItem value="PENDING">待审核</SelectItem>
          <SelectItem value="APPROVED">已通过</SelectItem>
          <SelectItem value="REJECTED">已驳回</SelectItem>
          <SelectItem value="SUPPLEMENT">待补充</SelectItem>
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
