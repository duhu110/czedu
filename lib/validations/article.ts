import { z } from "zod";

// ── 文章分类 ──

export const articleCategorySchema = z.object({
  name: z
    .string()
    .min(1, "分类名称不能为空")
    .max(50, "分类名称不能超过50个字符"),
  sortOrder: z.number().int().default(0),
});

export type ArticleCategoryInput = z.infer<typeof articleCategorySchema>;

// ── 文章状态枚举 ──

export const articleStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const articleStatusMap: Record<
  z.infer<typeof articleStatusEnum>,
  { label: string; variant: "secondary" | "default" | "outline" }
> = {
  DRAFT: { label: "草稿", variant: "secondary" },
  PUBLISHED: { label: "已发布", variant: "default" },
  ARCHIVED: { label: "已归档", variant: "outline" },
};

// ── 文章表单 ──

export const articleFormSchema = z.object({
  categoryId: z.string().min(1, "请选择文章分类"),
  title: z
    .string()
    .min(1, "请输入文章标题")
    .max(200, "标题不能超过200个字符"),
  content: z.string().min(1, "请输入文章内容"),
  status: articleStatusEnum,
});

export type ArticleFormInput = z.infer<typeof articleFormSchema>;
