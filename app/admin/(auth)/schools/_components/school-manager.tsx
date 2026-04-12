"use client";

import * as React from "react";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createSchool,
  deleteSchool,
  updateSchool,
} from "@/app/actions/school";
import {
  formatDistrictRangeText,
  type SchoolFormInput,
} from "@/lib/validations/school";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type SchoolRecord = {
  id: string;
  name: string;
  districtRange: string[];
  address: string;
  notice: string;
};

const emptyForm: SchoolFormInput = {
  name: "",
  districtRangeText: "",
  address: "",
  notice: "",
};

function toFormValues(school?: SchoolRecord): SchoolFormInput {
  if (!school) {
    return emptyForm;
  }

  return {
    name: school.name,
    districtRangeText: formatDistrictRangeText(school.districtRange),
    address: school.address,
    notice: school.notice,
  };
}

function SchoolFormDialog({
  mode,
  school,
  onSubmit,
  isPending,
  trigger,
}: {
  mode: "create" | "edit";
  school?: SchoolRecord;
  onSubmit: (values: SchoolFormInput) => Promise<boolean>;
  isPending: boolean;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<SchoolFormInput>(toFormValues(school));

  React.useEffect(() => {
    if (open) {
      setForm(toFormValues(school));
    }
  }, [open, school]);

  const title = mode === "create" ? "新增学校" : `编辑 ${school?.name ?? "学校"}`;
  const submitLabel = mode === "create" ? "创建学校" : "保存学校";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const shouldClose = await onSubmit(form);
            if (shouldClose) {
              setOpen(false);
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor={`${mode}-school-name`}>学校名称</Label>
            <Input
              id={`${mode}-school-name`}
              aria-label="学校名称"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-district-range`}>分区依据</Label>
            <Textarea
              id={`${mode}-district-range`}
              aria-label="分区依据"
              value={form.districtRangeText}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  districtRangeText: event.target.value,
                }))
              }
              className="min-h-48 resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-school-address`}>学校地址</Label>
            <Textarea
              id={`${mode}-school-address`}
              aria-label="学校地址"
              value={form.address}
              onChange={(event) =>
                setForm((current) => ({ ...current, address: event.target.value }))
              }
              className="min-h-40 resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-school-notice`}>学校须知</Label>
            <Textarea
              id={`${mode}-school-notice`}
              aria-label="学校须知"
              value={form.notice}
              onChange={(event) =>
                setForm((current) => ({ ...current, notice: event.target.value }))
              }
              className="min-h-40 resize-y"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteSchoolButton({
  school,
  onDelete,
  isPending,
}: {
  school: SchoolRecord;
  onDelete: () => Promise<void>;
  isPending: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          删除
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除学校？</AlertDialogTitle>
          <AlertDialogDescription>
            你确定要删除 <span className="font-bold text-foreground">{school.name}</span>{" "}
            吗？此操作不可撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SchoolManager({ schools }: { schools: SchoolRecord[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(schools);
  const [creating, setCreating] = React.useState(false);
  const [mutatingId, setMutatingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setItems(schools);
  }, [schools]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <SchoolFormDialog
          mode="create"
          isPending={creating}
          onSubmit={async (values) => {
            setCreating(true);
            const result = await createSchool(values);
            setCreating(false);

            if (!result.success) {
              toast.error(result.error || "创建学校失败");
              return false;
            }

            toast.success("学校创建成功");
            router.refresh();
            return true;
          }}
          trigger={
            <Button size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              新增学校
            </Button>
          }
        />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>学校名称</TableHead>
              <TableHead>分区依据</TableHead>
              <TableHead>学校地址</TableHead>
              <TableHead>学校须知</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  尚未录入学校信息，请先新增学校。
                </TableCell>
              </TableRow>
            ) : (
              items.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell className="max-w-md whitespace-pre-wrap text-sm text-muted-foreground">
                    {school.districtRange.join("\n")}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-pre-wrap text-sm">
                    {school.address || "-"}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-pre-wrap text-sm">
                    {school.notice || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <SchoolFormDialog
                        mode="edit"
                        school={school}
                        isPending={mutatingId === school.id}
                        onSubmit={async (values) => {
                          setMutatingId(school.id);
                          const result = await updateSchool(school.id, values);
                          setMutatingId(null);

                          if (!result.success) {
                            toast.error(result.error || "更新学校失败");
                            return false;
                          }

                          toast.success("学校更新成功");
                          router.refresh();
                          return true;
                        }}
                        trigger={
                          <Button type="button" variant="ghost" size="sm">
                            编辑
                          </Button>
                        }
                      />
                      <DeleteSchoolButton
                        school={school}
                        isPending={mutatingId === school.id}
                        onDelete={async () => {
                          setMutatingId(school.id);
                          const result = await deleteSchool(school.id);
                          setMutatingId(null);

                          if (!result.success) {
                            toast.error(result.error || "删除学校失败");
                            return;
                          }

                          setItems((current) =>
                            current.filter((item) => item.id !== school.id),
                          );
                          toast.success(`学校 ${school.name} 已删除`);
                          router.refresh();
                        }}
                      />
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
