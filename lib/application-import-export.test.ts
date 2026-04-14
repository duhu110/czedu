import { describe, expect, it } from "vitest";

import {
  APPLICATION_XLSX_HEADERS,
  buildApplicationExportRows,
  parseApplicationImportRows,
} from "@/lib/application-import-export";
import { createPendingApplication } from "@/tests/fixtures/application-factory";

describe("application import/export helpers", () => {
  it("exports rows with chinese headers, chinese status labels and blank targetSchool values", () => {
    const row = buildApplicationExportRows([
      createPendingApplication({
        targetSchool: null,
        adminRemark: null,
      }),
    ])[0];

    expect(Object.keys(row)).toEqual(APPLICATION_XLSX_HEADERS);
    expect(row["目标学校"]).toBe("");
    expect(row["房产情况"]).toBe("购房");
    expect(row["提交时间"]).toBe("2026-04-07");
    expect(row["状态"]).toBe("待审核");
    expect(row["审核备注"]).toBe("");
  });

  it("parses import rows using chinese headers", () => {
    const result = parseApplicationImportRows(APPLICATION_XLSX_HEADERS, [
      {
        工单编号: "app-1",
        学生姓名: "张三",
        身份证号: "630103201501010011",
        当前学校: "城中区第三小学",
        当前年级: "四年级",
        申请转入年级: "五年级",
        目标学校: "西关街小学",
        户籍类型: "城中区户籍",
        房产情况: "购房",
        提交时间: "2026/4/7",
        状态: "待审核",
        审核备注: "批量导入处理",
      },
    ]);

    expect(result).toEqual({
      success: true,
      error: null,
      data: [
        {
          id: "app-1",
          targetSchool: "西关街小学",
          status: "PENDING",
          adminRemark: "批量导入处理",
        },
      ],
    });
  });

  it("rejects non-chinese import headers", () => {
    const result = parseApplicationImportRows(["id", "status"], []);

    expect(result).toEqual({
      success: false,
      error: "导入模板表头不正确，仅支持中文列名的 XLSX 文件",
      data: [],
    });
  });
});
