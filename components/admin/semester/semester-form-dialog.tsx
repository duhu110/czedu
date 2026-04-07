"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createSemester, updateSemester } from "@/app/actions/semester";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  buildSemesterName,
  getDefaultSemesterFormValues,
  getSemesterWindow,
  getYearOptions,
  inferSemesterFormValues,
  type SemesterLike,
} from "@/lib/semester";
import {
  semesterFormSchema,
  type SemesterFormInput,
} from "@/lib/validations/semester";

type SharedSemesterFormDialogProps = {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
};

type CreateSemesterFormDialogProps = SharedSemesterFormDialogProps & {
  mode: "create";
  semester?: never;
};

type EditSemesterFormDialogProps = SharedSemesterFormDialogProps & {
  mode: "edit";
  semester: SemesterLike & { id: string };
};

type SemesterFormDialogProps =
  | CreateSemesterFormDialogProps
  | EditSemesterFormDialogProps;

function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function formatDateInputValue(date?: Date | null) {
  if (!isValidDate(date)) {
    return "";
  }

  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateInputValue(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  const parsed = new Date(Date.UTC(year, month - 1, day));

  return isValidDate(parsed) ? parsed : null;
}

function getDescribedByValue(...ids: Array<string | undefined>) {
  const value = ids.filter(Boolean).join(" ");

  return value || undefined;
}

export function SemesterFormDialog(props: SemesterFormDialogProps) {
  const { mode, trigger, defaultOpen = false } = props;

  if (mode === "edit" && !props.semester) {
    throw new Error("SemesterFormDialog requires a semester in edit mode.");
  }

  const semester = mode === "edit" ? props.semester : undefined;
  const getDialogValues = React.useCallback(() => {
    return mode === "edit" && semester
      ? inferSemesterFormValues(semester)
      : getDefaultSemesterFormValues();
  }, [mode, semester]);
  const [open, setOpen] = React.useState(defaultOpen);
  const initialValuesRef = React.useRef(getDialogValues());
  const form = useForm<SemesterFormInput>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: initialValuesRef.current,
  });
  const year = form.watch("year");
  const term = form.watch("term");
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const allowedWindow = getSemesterWindow(year, term);
  const previousTemplateRef = React.useRef({
    year: initialValuesRef.current.year,
    term: initialValuesRef.current.term,
  });
  const generatedName = buildSemesterName(year, term);
  const title = mode === "create" ? "创建学期" : "编辑学期";
  const submitLabel = mode === "create" ? "创建学期" : "保存学期";
  const yearErrorId = "semester-year-error";
  const termErrorId = "semester-term-error";
  const startDateErrorId = "semester-start-date-error";
  const endDateErrorId = "semester-end-date-error";
  const activeHelpId = "semester-active-help";

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const nextValues = getDialogValues();
    previousTemplateRef.current = {
      year: nextValues.year,
      term: nextValues.term,
    };
    form.reset(nextValues);
  }, [form, getDialogValues, open]);

  React.useEffect(() => {
    const previousTemplate = previousTemplateRef.current;
    if (previousTemplate.year !== year || previousTemplate.term !== term) {
      previousTemplateRef.current = { year, term };
      form.setValue("startDate", allowedWindow.start, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue("endDate", allowedWindow.end, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    if (
      isValidDate(startDate) &&
      (startDate < allowedWindow.start || startDate > allowedWindow.end)
    ) {
      form.setValue("startDate", allowedWindow.start, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (
      isValidDate(endDate) &&
      (endDate < allowedWindow.start || endDate > allowedWindow.end)
    ) {
      form.setValue("endDate", allowedWindow.end, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [allowedWindow.end, allowedWindow.start, endDate, form, startDate]);

  async function onSubmit(values: SemesterFormInput) {
    const result =
      mode === "edit" && semester
        ? await updateSemester(semester.id, values)
        : await createSemester(values);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(mode === "create" ? "学期创建成功" : "学期更新成功");
    setOpen(false);
    form.reset(getDialogValues());
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="semester-name">学期名称</Label>
            <Input id="semester-name" value={generatedName} readOnly />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="semester-year">学年</Label>
              <Controller
                control={form.control}
                name="year"
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger
                      id="semester-year"
                      aria-label="学年"
                      aria-invalid={Boolean(form.formState.errors.year)}
                      aria-describedby={getDescribedByValue(
                        form.formState.errors.year ? yearErrorId : undefined,
                      )}
                      className="w-full"
                    >
                      <SelectValue placeholder="选择学年" />
                    </SelectTrigger>
                    <SelectContent>
                      {getYearOptions().map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.year ? (
                <p id={yearErrorId} className="text-sm text-destructive">
                  {form.formState.errors.year.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester-term">学期</Label>
              <Controller
                control={form.control}
                name="term"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="semester-term"
                      aria-label="学期"
                      aria-invalid={Boolean(form.formState.errors.term)}
                      aria-describedby={getDescribedByValue(
                        form.formState.errors.term ? termErrorId : undefined,
                      )}
                      className="w-full"
                    >
                      <SelectValue placeholder="选择学期" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="春季">春季</SelectItem>
                      <SelectItem value="秋季">秋季</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.term ? (
                <p id={termErrorId} className="text-sm text-destructive">
                  {form.formState.errors.term.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="semester-start-date">开始日期</Label>
              <Controller
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <Input
                    id="semester-start-date"
                    aria-label="开始日期"
                    aria-invalid={Boolean(form.formState.errors.startDate)}
                    aria-describedby={getDescribedByValue(
                      form.formState.errors.startDate ? startDateErrorId : undefined,
                    )}
                    type="date"
                    min={formatDateInputValue(allowedWindow.start)}
                    max={formatDateInputValue(allowedWindow.end)}
                    value={formatDateInputValue(field.value)}
                    onChange={(event) => field.onChange(parseDateInputValue(event.target.value))}
                  />
                )}
              />
              {form.formState.errors.startDate ? (
                <p id={startDateErrorId} className="text-sm text-destructive">
                  {form.formState.errors.startDate.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester-end-date">结束日期</Label>
              <Controller
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <Input
                    id="semester-end-date"
                    aria-label="结束日期"
                    aria-invalid={Boolean(form.formState.errors.endDate)}
                    aria-describedby={getDescribedByValue(
                      form.formState.errors.endDate ? endDateErrorId : undefined,
                    )}
                    type="date"
                    min={formatDateInputValue(allowedWindow.start)}
                    max={formatDateInputValue(allowedWindow.end)}
                    value={formatDateInputValue(field.value)}
                    onChange={(event) => field.onChange(parseDateInputValue(event.target.value))}
                  />
                )}
              />
              {form.formState.errors.endDate ? (
                <p id={endDateErrorId} className="text-sm text-destructive">
                  {form.formState.errors.endDate.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-3xl bg-muted/40 px-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="semester-active">学期启用状态</Label>
              <p id={activeHelpId} className="text-sm text-muted-foreground">
                停用后，该学期将不能接受新的报名申请。
              </p>
            </div>
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  id="semester-active"
                  aria-label="学期启用状态"
                  aria-describedby={activeHelpId}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateSemesterDialogTrigger() {
  return (
    <Button size="sm">
      <PlusIcon className="mr-2 h-4 w-4" />
      新增学期
    </Button>
  );
}
