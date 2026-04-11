import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";

const statusMap = {
  PENDING: { label: "待审核", variant: "secondary" },
  APPROVED: { label: "已通过", variant: "default" },
  REJECTED: { label: "已驳回", variant: "destructive" },
  SUPPLEMENT: { label: "待补充资料", variant: "outline" },
  EDITING: { label: "待修改", variant: "outline" },
} as const;

export function DashboardApplicationTable({
  applications,
}: {
  applications: Array<{
    id: string;
    name: string;
    studentId: string;
    currentSchool: string;
    targetGrade: string;
    targetSchool: string | null;
    status: keyof typeof statusMap;
    createdAt: Date;
  }>;
}) {
  return (
    <Card className="mx-4 lg:mx-6">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>最新申请</CardTitle>
          <CardDescription>当前启用学期最近提交的申请记录</CardDescription>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/applications">查看全部</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>学生姓名</TableHead>
                <TableHead>学籍号</TableHead>
                <TableHead>当前学校</TableHead>
                <TableHead>转入年级</TableHead>
                <TableHead>分配学校</TableHead>
                <TableHead>提交时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    当前启用学期还没有转学申请
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.name}
                    </TableCell>
                    <TableCell>{application.studentId}</TableCell>
                    <TableCell>{application.currentSchool}</TableCell>
                    <TableCell>{application.targetGrade}</TableCell>
                    <TableCell>{application.targetSchool || "-"}</TableCell>
                    <TableCell>
                      {application.createdAt.toLocaleDateString("zh-CN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMap[application.status].variant}>
                        {statusMap[application.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/applications/${application.id}`}>
                          查看详情
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
