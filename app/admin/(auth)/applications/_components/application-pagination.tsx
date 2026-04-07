// app/admin/(auth)/applications/_components/application-pagination.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export function ApplicationPagination({ currentPage, pageCount }: { currentPage: number; pageCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => navigate(currentPage - 1)}
      >
        上一页
      </Button>
      <div className="text-sm font-medium">
        第 {currentPage} 页 / 共 {pageCount} 页
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= pageCount}
        onClick={() => navigate(currentPage + 1)}
      >
        下一页
      </Button>
    </div>
  );
}