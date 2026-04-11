"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  children: React.ReactNode;
}

interface LightboxImage {
  url: string;
  alt: string;
}

interface LightboxContextValue {
  open: (images: LightboxImage[], index: number) => void;
}

const LightboxContext = React.createContext<LightboxContextValue | null>(null);

export function useLightbox() {
  const ctx = React.useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used within ImageLightbox");
  return ctx;
}

/**
 * 灯箱容器 —— 包裹页面内容，提供预览上下文
 */
export function ImageLightbox({ children }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [images, setImages] = React.useState<LightboxImage[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [scale, setScale] = React.useState(1);

  const open = React.useCallback(
    (imgs: LightboxImage[], index: number) => {
      setImages(imgs);
      setCurrentIndex(index);
      setScale(1);
      setIsOpen(true);
    },
    [],
  );

  const current = images[currentIndex];
  const hasMultiple = images.length > 1;

  const prev = () => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    setScale(1);
  };
  const next = () => {
    setCurrentIndex((i) => (i + 1) % images.length);
    setScale(1);
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.5, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.5, 0.5));

  // 键盘导航
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, images.length]);

  const contextValue = React.useMemo(() => ({ open }), [open]);

  return (
    <LightboxContext.Provider value={contextValue}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/80" />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            {/* 顶部工具栏 */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <span className="text-white/70 text-sm mr-2">
                {currentIndex + 1} / {images.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  zoomOut();
                }}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  zoomIn();
                }}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* 标题（辅助功能） */}
            <DialogTitle className="sr-only">
              {current?.alt ?? "图片预览"}
            </DialogTitle>

            {/* 左右箭头 */}
            {hasMultiple && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-10 text-white hover:bg-white/20 h-10 w-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-10 text-white hover:bg-white/20 h-10 w-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* 图片 */}
            {current && (
              <div
                className="relative max-h-[85vh] max-w-[90vw] transition-transform duration-200"
                style={{ transform: `scale(${scale})` }}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={current.url}
                  alt={current.alt}
                  width={900}
                  height={900}
                  className="max-h-[85vh] w-auto object-contain rounded-lg"
                  priority
                />
              </div>
            )}

            {/* 底部标签 */}
            {current && (
              <div className="absolute bottom-6 text-center text-white/80 text-sm">
                {current.alt}
              </div>
            )}
          </div>
        </DialogPortal>
      </Dialog>
    </LightboxContext.Provider>
  );
}

/**
 * 可点击预览的图片 —— 替代原来的 <a> 链接
 */
export function PreviewableImage({
  url,
  alt,
  groupUrls,
  groupAlts,
  className,
}: {
  url: string;
  alt: string;
  /** 同组所有图片 url，用于在灯箱中左右切换 */
  groupUrls?: string[];
  /** 同组所有图片 alt */
  groupAlts?: string[];
  className?: string;
}) {
  const lightbox = useLightbox();

  const handleClick = () => {
    if (groupUrls && groupUrls.length > 0) {
      const imgs = groupUrls.map((u, i) => ({
        url: u,
        alt: groupAlts?.[i] ?? alt,
      }));
      const idx = groupUrls.indexOf(url);
      lightbox.open(imgs, idx >= 0 ? idx : 0);
    } else {
      lightbox.open([{ url, alt }], 0);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group relative aspect-square overflow-hidden rounded border bg-muted block w-full cursor-zoom-in",
        className,
      )}
    >
      <Image
        src={url}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 50vw, 25vw"
        className="object-cover transition group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
        <ZoomIn className="text-white h-6 w-6" />
      </div>
    </button>
  );
}
