import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArticleCategories } from "@/app/actions/article";
import { ArticleForm } from "../_components/article-form";

export default async function NewArticlePage() {
  const categories = await getArticleCategories();

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
          <h1 className="text-2xl font-bold tracking-tight">新建文章</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            创建新的文章内容。
          </p>
        </div>
      </div>

      <ArticleForm categories={categories} />
    </div>
  );
}
