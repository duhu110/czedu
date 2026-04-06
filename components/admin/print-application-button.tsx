"use client";

import { PrinterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintApplicationButton() {
  return (
    <Button onClick={() => window.print()} variant="outline">
      <PrinterIcon className="mr-2 size-4" />
      打印申请单
    </Button>
  );
}
