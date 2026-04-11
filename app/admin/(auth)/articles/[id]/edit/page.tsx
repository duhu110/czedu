import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArticleById, getArticleCategories } from "@/app/actions/article";
import { ArticleForm } from "../../_components/article-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;

  const [articleResult, categories] = await Promise.all([
    getArticleById(id),
    getArticleCategories(),
  ]);

  if (!articleResult.success || !articleResult.data) {
    notFound();
  }

  const article = articleResult.data;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/articles">
            <ArrowLeftIcon className="mr-1 size-4" />
            返回
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">编辑文章</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            修改文章「{article.title}」的内容。
          </p>
        </div>
      </div>

      <ArticleForm
        categories={categories}
        article={{
          id: article.id,
          categoryId: article.categoryId,
          title: article.title,
          content: article.content,
          status: article.status,
        }}
      />
    </div>
  );
}
