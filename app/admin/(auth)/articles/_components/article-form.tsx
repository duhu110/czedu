"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { Content } from "@tiptap/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import {
  articleFormSchema,
  articleStatusMap,
  type ArticleFormInput,
} from "@/lib/validations/article";
import { createArticle, updateArticle } from "@/app/actions/article";

interface Category {
  id: string;
  name: string;
}

interface ArticleData {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

interface ArticleFormProps {
  categories: Category[];
  article?: ArticleData;
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("上传失败");
  }

  const result = await response.json();
  return result.url;
}

export function ArticleForm({ categories, article }: ArticleFormProps) {
  const router = useRouter();
  const isEdit = !!article;

  const form = useForm<ArticleFormInput>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      categoryId: article?.categoryId ?? "",
      title: article?.title ?? "",
      content: article?.content ?? "",
      status: article?.status ?? "DRAFT",
    },
  });

  const [isPending, startTransition] = React.useTransition();

  const onSubmit = (data: ArticleFormInput) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateArticle(article.id, data)
        : await createArticle(data);

      if (!result.success) {
        toast.error(result.error ?? "操作失败");
        return;
      }

      toast.success(isEdit ? "文章已更新" : "文章已创建");
      router.push("/admin/articles");
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>文章标题</FormLabel>
                <FormControl>
                  <Input placeholder="请输入文章标题" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>文章分类</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>发布状态</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(articleStatusMap).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          {val.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>文章内容</FormLabel>
              <FormControl>
                <MinimalTiptapEditor
                  value={field.value as Content}
                  onChange={(value) => field.onChange(value)}
                  output="html"
                  placeholder="请输入文章内容..."
                  uploader={uploadImage}
                  throttleDelay={300}
                  className="min-h-[500px]"
                  editorContentClassName="p-4"
                  immediatelyRender={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            ) : null}
            {isEdit ? "保存修改" : "创建文章"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/articles")}
          >
            取消
          </Button>
        </div>
      </form>
    </Form>
  );
}
