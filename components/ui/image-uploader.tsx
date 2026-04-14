"use client";

import * as React from "react";
import { PlusIcon, XIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image"; // ✅ 新增引入

interface ImageUploaderProps {
  value: string[]; // 已上传的图片 URL 数组
  onChange: (value: string[]) => void; // 值改变时的回调
  disabled?: boolean;
  maxCount?: number; // 最大上传张数限制，默认不限
  hasError?: boolean;
}

// 单张图片上传状态接口
interface UploadingFile {
  id: string; // 临时 ID，用于列表渲染
  name: string;
  progress: number;
  error?: string;
}

export function ImageUploader({
  value,
  onChange,
  disabled,
  maxCount,
  hasError,
}: ImageUploaderProps) {
  // 内部状态：记录正在上传中的文件信息
  const [uploadingFiles, setUploadingFiles] = React.useState<UploadingFile[]>(
    [],
  );
  // 内部状态：控制整个上传区域的 Loading 状态
  const [isGlobalLoading, setIsGlobalLoading] = React.useState(false);

  // 隐藏的 input[type=file] 的引用
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 处理文件选择逻辑
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList); // TS 现在能正确识别这是 File[] 类型

    // 检查上传张数限制
    if (maxCount && value.length + files.length > maxCount) {
      alert(`最多只能上传 ${maxCount} 张照片`); // 简单提示，项目大时可替换为 toast
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsGlobalLoading(true);

    // 准备将新文件假如上传队列
    const newUploadingFiles: UploadingFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`, // 生成临时 ID
      name: file.name,
      progress: 0,
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    // 并发执行上传
    const uploadPromises = files.map((file, index) =>
      uploadSingleFile(file, newUploadingFiles[index].id),
    );

    // 等待所有上传完成（无论成功失败）
    const results = await Promise.all(uploadPromises);

    // 过滤掉失败的，把成功的 URL 加入到已存在的 value 中
    const successfulUrls = results.filter((url): url is string => url !== null);
    if (successfulUrls.length > 0) {
      onChange([...value, ...successfulUrls]);
    }

    setIsGlobalLoading(false);

    // 清空 input 的值，确保同一个文件可以再次选择上传
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 单个文件上传逻辑
  const uploadSingleFile = async (
    file: File,
    id: string,
  ): Promise<string | null> => {
    // 基础校验：单张大小限制，如 5MB
    if (file.size > 5 * 1024 * 1024) {
      updateUploadingState(id, { error: "文件超过5MB限制" });
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // ✅ 对接我们在后端写好的 API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.url) {
        // 上传成功，将该文件从上传队列中移除
        setUploadingFiles((prev) => prev.filter((item) => item.id !== id));
        return data.url;
      } else {
        updateUploadingState(id, { error: data.error || "上传失败" });
        return null;
      }
    } catch (error) {
      console.error("Single Upload Error:", error);
      updateUploadingState(id, { error: "网络错误" });
      return null;
    }
  };

  // 辅助函数：更新上传中文件的状态（用于错误提示）
  const updateUploadingState = (id: string, update: Partial<UploadingFile>) => {
    setUploadingFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...update } : item)),
    );
  };

  // 删除已上传的照片
  const handleDelete = (urlToDelete: string) => {
    onChange(value.filter((url) => url !== urlToDelete));
  };

  return (
    <div className="space-y-4">
      {/* 隐藏的文件输入框 */}
      <input
        type="file"
        multiple // 支持多选
        accept="image/png, image/jpeg, image/jpg" // 限制类型
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isGlobalLoading}
      />

      {/* 照片预览网格 */}
      <div className="grid grid-cols-3 gap-3">
        {/* 1. 渲染已上传完成的照片 */}
        {value.map((url) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            <Image
              src={url}
              alt="uploaded image"
              fill
              unoptimized
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 33vw, 25vw"
            />
            {/* 删除按钮 */}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-80 shadow-md group-hover:opacity-100 transition"
              onClick={() => handleDelete(url)}
              disabled={disabled || isGlobalLoading}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* 2. 渲染正在上传中的占位块 */}
        {uploadingFiles.map((file) => (
          <div
            key={file.id}
            className={cn(
              "relative aspect-square rounded-lg border border-dashed flex flex-col items-center justify-center p-2 text-center bg-muted/30",
              file.error && "border-destructive/50 bg-destructive/5",
            )}
          >
            {file.error ? (
              <>
                <XIcon className="h-6 w-6 text-destructive mb-1" />
                <span className="text-[10px] text-destructive leading-tight line-clamp-2">
                  {file.error}
                </span>
              </>
            ) : (
              <>
                <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground truncate w-full">
                  正在上传...
                </span>
              </>
            )}
            {/* 删除/取消正在上传的文件 */}
            <button
              type="button"
              className="absolute top-1 right-1 text-muted-foreground hover:text-destructive"
              onClick={() =>
                setUploadingFiles((prev) =>
                  prev.filter((item) => item.id !== file.id),
                )
              }
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* 3. “添加照片” 按钮 (如果不满张数限制且非全局禁用) */}
        {(!maxCount || value.length < maxCount) && !disabled && (
          <div
            className={cn(
              "relative aspect-square rounded-lg border border-dashed flex flex-col items-center justify-center cursor-pointer transition",
              "border-muted-foreground/30 hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground",
              hasError && "border-destructive/50 bg-destructive/5",
              isGlobalLoading &&
                "opacity-60 cursor-not-allowed hover:border-muted-foreground/30 hover:bg-transparent",
            )}
            onClick={() => !isGlobalLoading && fileInputRef.current?.click()}
          >
            {isGlobalLoading ? (
              <Loader2Icon className="h-6 w-6 animate-spin" />
            ) : (
              <PlusIcon className="h-8 w-8" />
            )}
            <span className="mt-1 text-xs">添加照片</span>
          </div>
        )}
      </div>
    </div>
  );
}
