"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DownloadIcon, EyeIcon } from "lucide-react";
import { toast } from "sonner";

import { ApplicationStatusBadge } from "@/components/admin/application-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type TransferApplication } from "@/lib/admin/mock-transfer-applications";

const PAGE_SIZE = 10;

export function ApplicationTable({
  data,
  title = "申请结果列表",
}: {
  data: TransferApplication[];
  title?: string;
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));

  const currentRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  return (
    <Card className="mx-4 lg:mx-6">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>{title}</CardTitle>
        <Button
          variant="outline"
          onClick={() => toast.success(`已模拟导出第 ${page} 页申请数据`)}
        >
          <DownloadIcon className="mr-2 size-4" />
          模拟导出
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>学生姓名</TableHead>
                <TableHead>学籍号</TableHead>
                <TableHead>当前学校</TableHead>
                <TableHead>目标学校</TableHead>
                <TableHead>申请日期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>审核人</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.studentName}</TableCell>
                  <TableCell>{item.studentId}</TableCell>
                  <TableCell>{item.currentSchool}</TableCell>
                  <TableCell>{item.targetSchool}</TableCell>
                  <TableCell>{item.applyDate}</TableCell>
                  <TableCell>
                    <ApplicationStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>{item.reviewer}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/users/${item.id}`}>
                        <EyeIcon className="mr-2 size-4" />
                        查看详情
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            第 {page} 页，共 {pageCount} 页
          </span>
          <div className="flex gap-2">
            <Button
              disabled={page === 1}
              size="sm"
              variant="outline"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              上一页
            </Button>
            <Button
              disabled={page === pageCount}
              size="sm"
              variant="outline"
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
            >
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
