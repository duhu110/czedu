"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  articleCategorySchema,
  articleFormSchema,
  type ArticleCategoryInput,
  type ArticleFormInput,
} from "@/lib/validations/article";
import { Prisma, type ArticleStatus } from "@prisma/client";

const articleRevalidationPaths = ["/admin/articles", "/admin"] as const;

function revalidateArticlePaths() {
  for (const path of articleRevalidationPaths) {
    revalidatePath(path);
  }
}

function getUniqueConflictMessage(error: unknown) {
  const code =
    typeof error === "object" && error !== null
      ? Reflect.get(error, "code")
      : undefined;
  if (code === "P2002") {
    return "该分类已存在";
  }
  return null;
}

function getDeleteErrorMessage(error: unknown, fallback: string) {
  const code =
    typeof error === "object" && error !== null
      ? Reflect.get(error, "code")
      : undefined;
  const message =
    typeof error === "object" && error !== null
      ? Reflect.get(error, "message")
      : "";

  if (
    code === "P2003" ||
    code === "P2014" ||
    /foreign key|relation/i.test(String(message))
  ) {
    return "该分类下存在文章，无法删除";
  }

  return fallback;
}

// ==========================================
// 分类 CRUD
// ==========================================

export async function getArticleCategories() {
  return await prisma.articleCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createArticleCategory(data: ArticleCategoryInput) {
  const parsed = articleCategorySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "输入数据非法" };
  }

  try {
    await prisma.articleCategory.create({ data: parsed.data });
    revalidateArticlePaths();
    return { success: true };
  } catch (error) {
    return {
      error: getUniqueConflictMessage(error) ?? "创建失败，请稍后再试",
    };
  }
}

export async function updateArticleCategory(
  id: string,
  data: ArticleCategoryInput,
) {
  const parsed = articleCategorySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "输入数据非法" };
  }

  try {
    await prisma.articleCategory.update({
      where: { id },
      data: parsed.data,
    });
    revalidateArticlePaths();
    return { success: true };
  } catch (error) {
    return {
      error: getUniqueConflictMessage(error) ?? "更新失败，请稍后再试",
    };
  }
}

export async function deleteArticleCategory(id: string) {
  try {
    await prisma.articleCategory.delete({ where: { id } });
    revalidateArticlePaths();
    return { success: true };
  } catch (error) {
    return { error: getDeleteErrorMessage(error, "删除失败，请稍后再试") };
  }
}

// ==========================================
// 文章 CRUD
// ==========================================

export async function getArticles(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ArticleStatus;
  categoryId?: string;
}) {
  try {
    const {
      page = 1,
      pageSize = 10,
      search,
      status,
      categoryId,
    } = params;

    const where: Prisma.ArticleWhereInput = {
      AND: [
        status ? { status } : {},
        categoryId ? { categoryId } : {},
        search ? { title: { contains: search } } : {},
      ],
    };

    const [total, records] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true } },
        },
      }),
    ]);

    return {
      success: true,
      data: records,
      meta: {
        total,
        pageCount: Math.ceil(total / pageSize),
        currentPage: page,
      },
      error: null,
    };
  } catch (e) {
    console.error("Get Articles Error:", e);
    return {
      success: false,
      data: [],
      meta: { total: 0, pageCount: 0, currentPage: 1 },
      error: "获取数据失败",
    };
  }
}

export async function getArticleById(id: string) {
  try {
    const record = await prisma.article.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!record) {
      return { success: false, data: null, error: "未找到该文章" };
    }

    return { success: true, data: record, error: null };
  } catch (e) {
    console.error("Get Article Error:", e);
    return { success: false, data: null, error: "获取详情失败" };
  }
}

export async function createArticle(data: ArticleFormInput) {
  try {
    const parsed = articleFormSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "数据验证失败，请检查填写内容" };
    }

    await prisma.article.create({
      data: {
        ...parsed.data,
        publishedAt:
          parsed.data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    revalidateArticlePaths();
    return { success: true, error: null };
  } catch (e) {
    console.error("Create Article Error:", e);
    return { success: false, error: "创建文章失败" };
  }
}

export async function updateArticle(id: string, data: ArticleFormInput) {
  try {
    const parsed = articleFormSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "数据验证失败，请检查填写内容" };
    }

    // 如果状态变为已发布且之前没有发布时间，则设置发布时间
    let publishedAt: Date | undefined;
    if (parsed.data.status === "PUBLISHED") {
      const existing = await prisma.article.findUnique({
        where: { id },
        select: { publishedAt: true },
      });
      if (!existing?.publishedAt) {
        publishedAt = new Date();
      }
    }

    await prisma.article.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(publishedAt !== undefined ? { publishedAt } : {}),
      },
    });

    revalidateArticlePaths();
    revalidatePath(`/admin/articles/${id}/edit`);
    return { success: true, error: null };
  } catch (e) {
    console.error("Update Article Error:", e);
    return { success: false, error: "更新文章失败" };
  }
}

export async function deleteArticle(id: string) {
  try {
    await prisma.article.delete({ where: { id } });
    revalidateArticlePaths();
    return { success: true, error: null };
  } catch (e) {
    console.error("Delete Article Error:", e);
    return { success: false, error: "删除失败" };
  }
}
