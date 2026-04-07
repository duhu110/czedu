import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateSemesterDialog } from "@/components/admin/semester/create-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function SemesterPage() {
  const semesters = await prisma.semester.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">学期管理</h1>
          <p className="text-muted-foreground text-sm">
            配置和维护系统业务学期时间段。
          </p>
        </div>
        <CreateSemesterDialog />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>学期名称</TableHead>
              <TableHead>起止日期</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semesters.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  尚未创建任何学期，请点击右上角新增。
                </TableCell>
              </TableRow>
            ) : (
              semesters.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    {format(s.startDate, "yyyy-MM-dd")} 至{" "}
                    {format(s.endDate, "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>
                    {new Date() >= s.startDate && new Date() <= s.endDate ? (
                      <Badge variant="default">进行中</Badge>
                    ) : (
                      <Badge variant="secondary">非活动</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      编辑
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
