import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { type ApplicationStatus } from "@prisma/client";

import { getApplicationsForExport } from "@/app/actions/application";
import {
  APPLICATION_XLSX_HEADERS,
  buildApplicationExportRows,
} from "@/lib/application-import-export";
import { getCurrentAdmin } from "@/lib/admin-session";
import { getAdminSelectedSemester } from "@/lib/admin-selected-semester";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "请先登录管理员账号" }, { status: 401 });
  }

  const selectedSemester = await getAdminSelectedSemester();
  if (!selectedSemester) {
    return NextResponse.json({ error: "请先选择一个学期" }, { status: 400 });
  }

  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const status =
    (request.nextUrl.searchParams.get("status") as ApplicationStatus | null) ??
    undefined;

  const result = await getApplicationsForExport({
    search,
    status,
    semesterId: selectedSemester.id,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error || "导出失败" }, { status: 500 });
  }

  const workbook = XLSX.utils.book_new();
  const rows = buildApplicationExportRows(result.data);
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [...APPLICATION_XLSX_HEADERS],
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, "转学申请");

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
        'attachment; filename="applications-export.xlsx"',
    },
  });
}
