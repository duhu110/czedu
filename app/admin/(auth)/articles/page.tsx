import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ArticleStatus } from "@prisma/client";
import { getArticles, getArticleCategories } from "@/app/actions/article";
import { articleStatusMap } from "@/lib/validations/article";
import { ArticleFilters } from "./_components/article-filters";
import { ArticlePagination } from "./_components/article-pagination";
import { DeleteArticleButton } from "./_components/delete-article-button";
import { CategoryManagementDialog } from "./_components/category-management-dialog";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    categoryId?: string;
  }>;
}

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  const [{ data: articles = [], meta }, categories] = await Promise.all([
    getArticles({
      page: currentPage,
      pageSize: 10,
      search: params.search,
      status: params.status as ArticleStatus,
      categoryId: params.categoryId,
    }),
    getArticleCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">文章管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理和编辑所有文章内容。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CategoryManagementDialog categories={categories} />
          <Button asChild>
            <Link href="/admin/articles/new">新建文章</Link>
          </Button>
        </div>
      </div>

      <ArticleFilters categories={categories} />

      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>发布时间</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  暂无文章数据
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => {
                const statusInfo = articleStatusMap[article.status];
                return (
                  <TableRow key={article.id}>
                    <TableCell className="max-w-xs truncate font-medium">
                      {article.title}
                    </TableCell>
                    <TableCell>{article.category.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {article.publishedAt
                        ? article.publishedAt.toLocaleDateString("zh-CN")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {article.createdAt.toLocaleDateString("zh-CN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/articles/${article.id}/edit`}>
                            编辑
                          </Link>
                        </Button>
                        <DeleteArticleButton
                          id={article.id}
                          title={article.title}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          共 {meta.total} 篇文章
        </p>
        <ArticlePagination
          currentPage={meta.currentPage}
          pageCount={meta.pageCount}
        />
      </div>
    </div>
  );
}
