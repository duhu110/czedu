"use client";

import Link from "next/link";
import {
  startTransition,
  type ChangeEvent,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ApplicationImportExportToolbarProps {
  search?: string;
  status?: string;
  disabled: boolean;
}

function buildExportHref(search?: string, status?: string) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (status) {
    params.set("status", status);
  }

  const query = params.toString();
  return query ? `/admin/applications/export?${query}` : "/admin/applications/export";
}

export function ApplicationImportExportToolbar({
  search,
  status,
  disabled,
}: ApplicationImportExportToolbarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportClick = () => {
    inputRef.current?.click();
  };

  const uploadFile = async (file: File) => {
    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/admin/applications/import", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as {
        success: boolean;
        error?: string | null;
        updatedCount?: number;
        skippedCount?: number;
      };

      if (!response.ok || !result.success) {
        toast.error(result.error || "导入失败", { position: "top-center" });
        return;
      }

      toast.success(
        `导入完成：更新 ${result.updatedCount ?? 0} 条，跳过 ${result.skippedCount ?? 0} 条`,
      );
      router.refresh();
    } catch (error) {
      console.error("Import Applications Toolbar Error:", error);
      toast.error("导入失败");
    } finally {
      setIsImporting(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    startTransition(() => {
      void uploadFile(file);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {disabled ? (
        <Button variant="outline" disabled>
          导出数据
        </Button>
      ) : (
        <Button variant="outline" asChild>
          <Link href={buildExportHref(search, status)}>导出数据</Link>
        </Button>
      )}

      {disabled ? (
        <Button variant="outline" disabled>
          下载导入模板
        </Button>
      ) : (
        <Button variant="outline" asChild>
          <Link href="/admin/applications/template">下载导入模板</Link>
        </Button>
      )}

      <Button
        variant="default"
        onClick={handleImportClick}
        disabled={disabled || isImporting}
      >
        {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        导入数据
      </Button>

      <input
        ref={inputRef}
        aria-label="导入 XLSX 文件"
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
