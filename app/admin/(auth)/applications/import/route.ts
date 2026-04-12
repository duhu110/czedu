import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { importApplicationsFromRows } from "@/app/actions/application";
import {
  parseApplicationImportRows,
} from "@/lib/application-import-export";
import { getCurrentAdmin } from "@/lib/admin-session";
import { getAdminSelectedSemester } from "@/lib/admin-selected-semester";

function isSupportedXlsxFile(file: File) {
  return file.name.toLowerCase().endsWith(".xlsx");
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "请先登录管理员账号" }, { status: 401 });
  }

  const selectedSemester = await getAdminSelectedSemester();
  if (!selectedSemester) {
    return NextResponse.json({ error: "请先选择一个学期" }, { status: 400 });
  }

  const data = await request.formData();
  const file = data.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "没有找到导入文件" }, { status: 400 });
  }

  if (!isSupportedXlsxFile(file)) {
    return NextResponse.json(
      { error: "仅支持 XLSX 格式文件导入" },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const workbook = XLSX.read(bytes, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = firstSheetName ? workbook.Sheets[firstSheetName] : null;

  if (!worksheet) {
    return NextResponse.json({ error: "导入文件内容为空" }, { status: 400 });
  }

  const sheetRows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    blankrows: false,
  }) as unknown[][];
  const headerRow = Array.isArray(sheetRows[0])
    ? sheetRows[0].map((cell) => String(cell ?? "").trim())
    : [];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
  });

  const parsed = parseApplicationImportRows(headerRow, rawRows);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await importApplicationsFromRows(
    parsed.data,
    selectedSemester.id,
  );

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
