import { getSemesters } from "@/app/actions/semester";
import { CreateSemesterDialog } from "@/components/admin/semester/create-dialog";
import { DeleteSemesterButton } from "@/components/admin/semester/delete-button";
import { ToggleActiveButton } from "@/components/admin/semester/toggle-active-button";
import { SemesterFormDialog } from "@/components/admin/semester/semester-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSemesterTimelineStatus } from "@/lib/semester";
import { formatBeijingDate } from "@/lib/china-time";

export default async function SemesterPage() {
  const semesters = await getSemesters();

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
              <TableHead>时间状态</TableHead>
              <TableHead>启用状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semesters.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
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
                    {formatBeijingDate(s.startDate)} 至{" "}
                    {formatBeijingDate(s.endDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getSemesterTimelineStatus(s)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.isActive ? "default" : "secondary"}>
                      {s.isActive ? "已启用" : "已停用"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <SemesterFormDialog
                        mode="edit"
                        semester={s}
                        trigger={
                          <Button type="button" variant="ghost" size="sm" aria-label={`编辑 ${s.name}`}>
                            编辑
                          </Button>
                        }
                      />
                      <ToggleActiveButton id={s.id} name={s.name} isActive={s.isActive} />
                      <DeleteSemesterButton id={s.id} name={s.name} />
                    </div>
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
