"use client";

import * as React from "react";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createAdminUser, updateAdminUser } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { formatBeijingDateTime } from "@/lib/china-time";

type AdminRecord = {
  id: string;
  username: string;
  name: string | null;
  isActive: boolean;
  isSuperAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type CreateFormState = {
  username: string;
  password: string;
  name: string;
  isActive: boolean;
  isSuperAdmin: boolean;
};

type UpdateFormState = {
  name: string;
  password: string;
  isActive: boolean;
  isSuperAdmin: boolean;
};

const emptyCreateForm: CreateFormState = {
  username: "",
  password: "",
  name: "",
  isActive: true,
  isSuperAdmin: false,
};

function getUpdateForm(admin: AdminRecord): UpdateFormState {
  return {
    name: admin.name ?? "",
    password: "",
    isActive: admin.isActive,
    isSuperAdmin: admin.isSuperAdmin,
  };
}

function AdminCheckboxField({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
      />
      <span>{label}</span>
    </label>
  );
}

function CreateAdminDialog({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (values: CreateFormState) => Promise<boolean>;
}) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<CreateFormState>(emptyCreateForm);

  React.useEffect(() => {
    if (open) {
      setForm(emptyCreateForm);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          新增管理员
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>新增管理员</DialogTitle>
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
            <Label htmlFor="create-admin-username">登录用户名</Label>
            <Input
              id="create-admin-username"
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-admin-name">姓名</Label>
            <Input
              id="create-admin-name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-admin-password">初始密码</Label>
            <Input
              id="create-admin-password"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminCheckboxField
              label="账号启用"
              checked={form.isActive}
              onCheckedChange={(isActive) =>
                setForm((current) => ({ ...current, isActive }))
              }
            />
            <AdminCheckboxField
              label="超级管理员"
              checked={form.isSuperAdmin}
              onCheckedChange={(isSuperAdmin) =>
                setForm((current) => ({ ...current, isSuperAdmin }))
              }
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
              创建管理员
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditAdminDialog({
  admin,
  pending,
  onSubmit,
}: {
  admin: AdminRecord;
  pending: boolean;
  onSubmit: (values: UpdateFormState) => Promise<boolean>;
}) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<UpdateFormState>(getUpdateForm(admin));

  React.useEffect(() => {
    if (open) {
      setForm(getUpdateForm(admin));
    }
  }, [admin, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          编辑
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>编辑管理员</DialogTitle>
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
            <Label htmlFor={`admin-username-${admin.id}`}>登录用户名</Label>
            <Input
              id={`admin-username-${admin.id}`}
              value={admin.username}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`admin-name-${admin.id}`}>姓名</Label>
            <Input
              id={`admin-name-${admin.id}`}
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`admin-password-${admin.id}`}>重置密码</Label>
            <Input
              id={`admin-password-${admin.id}`}
              type="password"
              value={form.password}
              placeholder="留空表示不修改"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminCheckboxField
              label="账号启用"
              checked={form.isActive}
              onCheckedChange={(isActive) =>
                setForm((current) => ({ ...current, isActive }))
              }
            />
            <AdminCheckboxField
              label="超级管理员"
              checked={form.isSuperAdmin}
              onCheckedChange={(isSuperAdmin) =>
                setForm((current) => ({ ...current, isSuperAdmin }))
              }
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
              保存修改
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminUserManager({ admins }: { admins: AdminRecord[] }) {
  const router = useRouter();
  const [creating, setCreating] = React.useState(false);
  const [mutatingId, setMutatingId] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateAdminDialog
          pending={creating}
          onSubmit={async (values) => {
            setCreating(true);
            const result = await createAdminUser(values);
            setCreating(false);

            if (!result.success) {
              toast.error(result.error || "创建管理员失败");
              return false;
            }

            toast.success("管理员创建成功");
            router.refresh();
            return true;
          }}
        />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  当前还没有管理员账号。
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.username}</TableCell>
                  <TableCell>{admin.name || "-"}</TableCell>
                  <TableCell>
                    {admin.isSuperAdmin ? (
                      <Badge>超级管理员</Badge>
                    ) : (
                      <Badge variant="secondary">普通管理员</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {admin.isActive ? (
                      <Badge variant="outline">启用</Badge>
                    ) : (
                      <Badge variant="destructive">停用</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatBeijingDateTime(admin.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <EditAdminDialog
                      admin={admin}
                      pending={mutatingId === admin.id}
                      onSubmit={async (values) => {
                        setMutatingId(admin.id);
                        const result = await updateAdminUser(admin.id, values);
                        setMutatingId(null);

                        if (!result.success) {
                          toast.error(result.error || "更新管理员失败");
                          return false;
                        }

                        toast.success("管理员更新成功");
                        router.refresh();
                        return true;
                      }}
                    />
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
