"use client";

import {
  CreateSemesterDialogTrigger,
  SemesterFormDialog,
} from "@/components/admin/semester/semester-form-dialog";

export function CreateSemesterDialog() {
  return (
    <SemesterFormDialog
      mode="create"
      trigger={<CreateSemesterDialogTrigger />}
    />
  );
}
