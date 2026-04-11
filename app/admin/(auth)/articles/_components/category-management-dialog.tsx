"use client";

import * as React from "react";
import { Loader2Icon, PencilIcon, TrashIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  createArticleCategory,
  updateArticleCategory,
  deleteArticleCategory,
} from "@/app/actions/article";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

interface CategoryManagementDialogProps {
  categories: Category[];
}

export function CategoryManagementDialog({
  categories,
}: CategoryManagementDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newSortOrder, setNewSortOrder] = React.useState("0");
  const [isCreating, startCreateTransition] = React.useTransition();

  const handleCreate = () => {
    if (!newName.trim()) return;
    startCreateTransition(async () => {
      const result = await createArticleCategory({
        name: newName.trim(),
        sortOrder: Number(newSortOrder) || 0,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("分类已创建");
      setNewName("");
      setNewSortOrder("0");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          分类管理
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>文章分类管理</DialogTitle>
        </DialogHeader>

        {/* 新增分类 */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="分类名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1"
          />
          <Input
            placeholder="排序"
            type="number"
            value={newSortOrder}
            onChange={(e) => setNewSortOrder(e.target.value)}
            className="w-20"
          />
          <Button size="sm" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <PlusIcon className="size-4" />
            )}
          </Button>
        </div>

        {/* 分类列表 */}
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              暂无分类，请添加。
            </p>
          ) : (
            categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(category.name);
  const [sortOrder, setSortOrder] = React.useState(
    String(category.sortOrder),
  );
  const [isUpdating, startUpdateTransition] = React.useTransition();
  const [isDeleting, startDeleteTransition] = React.useTransition();

  const handleUpdate = () => {
    if (!name.trim()) return;
    startUpdateTransition(async () => {
      const result = await updateArticleCategory(category.id, {
        name: name.trim(),
        sortOrder: Number(sortOrder) || 0,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("分类已更新");
      setIsEditing(false);
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteArticleCategory(category.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`分类「${category.name}」已删除`);
    });
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 rounded-md border p-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
          className="flex-1"
        />
        <Input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-20"
        />
        <Button
          size="sm"
          onClick={handleUpdate}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            "保存"
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsEditing(false);
            setName(category.name);
            setSortOrder(String(category.sortOrder));
          }}
        >
          取消
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-md border p-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{category.name}</span>
        <span className="text-xs text-muted-foreground">
          排序: {category.sortOrder}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          aria-label={`编辑 ${category.name}`}
        >
          <PencilIcon className="size-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={`删除 ${category.name}`}
            >
              <TrashIcon className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除分类？</AlertDialogTitle>
              <AlertDialogDescription>
                你确定要删除分类{" "}
                <span className="font-bold text-foreground">
                  {category.name}
                </span>{" "}
                吗？如果该分类下已有文章，删除会失败。此操作不可撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                ) : null}
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
