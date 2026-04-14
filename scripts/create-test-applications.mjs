import "dotenv/config";

process.env.TZ = "Asia/Shanghai";
process.env.PGTZ = "Asia/Shanghai";

import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

import {
  buildApplicationSeedRecords,
  parseSeedCountArg,
} from "./create-test-applications-utils.mjs";

const applicationTestRecordIds = {
  pending: "test-application-pending",
  supplement: "test-application-supplement",
  approved: "test-application-approved",
  rejected: "test-application-rejected",
};

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../public/uploads");
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function getUploadPaths() {
  const files = await readdir(uploadsDir, { withFileTypes: true });

  return files
    .filter(
      (entry) =>
        entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()),
    )
    .map((entry) => `/uploads/${entry.name}`)
    .sort((left, right) => left.localeCompare(right));
}

async function getTargetSemester() {
  const now = new Date();

  const activeSemester = await prisma.semester.findFirst({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { startDate: "desc" },
  });

  if (activeSemester) {
    return activeSemester;
  }

  return prisma.semester.findFirst({
    orderBy: { startDate: "desc" },
  });
}

async function main() {
  const semester = await getTargetSemester();

  if (!semester) {
    throw new Error("未找到任何学期，请先创建学期后再执行测试申请脚本。");
  }

  const uploadPaths = await getUploadPaths();
  const count = parseSeedCountArg(process.argv.slice(2));
  const records = buildApplicationSeedRecords({
    semesterId: semester.id,
    uploadPaths,
    count,
  });

  const stableIds = new Set(Object.values(applicationTestRecordIds));
  const stableRecords = records.filter((record) => stableIds.has(record.id));
  const randomRecords = records.filter((record) => !stableIds.has(record.id));

  for (const record of stableRecords) {
    await prisma.application.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  for (const record of randomRecords) {
    await prisma.application.create({
      data: record,
    });
  }

  console.log(`已更新固定演示申请单 ${stableRecords.length} 条。`);
  console.log(JSON.stringify(applicationTestRecordIds, null, 2));
  console.log(`已新增随机申请单 ${randomRecords.length} 条。`);
  console.log(`所属学期: ${semester.name} (${semester.id})`);
  console.log(`使用上传图片 ${uploadPaths.length} 张，目录: ${uploadsDir}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
