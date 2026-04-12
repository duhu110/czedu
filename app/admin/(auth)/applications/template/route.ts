import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { APPLICATION_XLSX_HEADERS } from "@/lib/application-import-export";
import { getCurrentAdmin } from "@/lib/admin-session";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "请先登录管理员账号" }, { status: 401 });
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([[...APPLICATION_XLSX_HEADERS]]);

  XLSX.utils.book_append_sheet(workbook, worksheet, "导入模板");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="applications-template.xlsx"',
    },
  });
}
