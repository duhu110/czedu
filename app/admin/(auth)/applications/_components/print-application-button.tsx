"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintApplicationButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="gap-2 print:hidden"
    >
      <Printer className="h-4 w-4" />
      打印申请单
    </Button>
  );
}
