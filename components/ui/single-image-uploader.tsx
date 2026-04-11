"use client";

import * as React from "react";
import { PlusIcon, XIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface SingleImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  hasError?: boolean;
}

export function SingleImageUploader({
  value,
  onChange,
  disabled,
  label,
  hasError,
}: SingleImageUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("文件超过5MB限制");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "上传失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className="space-y-1">
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
          <Image
            src={value}
            alt={label || "uploaded image"}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-80 shadow-md group-hover:opacity-100 transition"
            onClick={handleDelete}
            disabled={disabled || isUploading}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "relative aspect-square rounded-lg border border-dashed flex flex-col items-center justify-center cursor-pointer transition",
            "border-muted-foreground/30 hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground",
            (error || hasError) && "border-destructive/50 bg-destructive/5",
            (disabled || isUploading) &&
              "opacity-60 cursor-not-allowed hover:border-muted-foreground/30 hover:bg-transparent",
          )}
          onClick={() =>
            !disabled && !isUploading && fileInputRef.current?.click()
          }
        >
          {isUploading ? (
            <Loader2Icon className="h-6 w-6 animate-spin" />
          ) : (
            <PlusIcon className="h-6 w-6" />
          )}
          {label && (
            <span className="mt-1 text-xs text-center px-1 leading-tight">
              {label}
            </span>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
