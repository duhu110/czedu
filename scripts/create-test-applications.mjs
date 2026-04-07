import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

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

function json(value) {
  return JSON.stringify(value);
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

function buildApplicationRecords(semesterId) {
  return [
    {
      id: applicationTestRecordIds.pending,
      status: "PENDING",
      adminRemark: null,
      targetSchool: null,
      residencyType: "LOCAL",
      name: "测试待审核申请",
      gender: "MALE",
      idCard: "110101201201011231",
      studentId: "G2026000001",
      guardian1Name: "待审核监护人",
      guardian1Phone: "13800000001",
      guardian2Name: "",
      guardian2Phone: "",
      currentSchool: "城中区实验小学",
      currentGrade: "二年级",
      targetGrade: "三年级",
      hukouAddress: "城中区光明路1号",
      livingAddress: "城中区光明路1号1单元101",
      fileHukou: json(["/seed/pending-hukou.png"]),
      fileProperty: json(["/seed/pending-property.png"]),
      fileStudentCard: json(["/seed/pending-student-card.png"]),
      fileResidencePermit: json([]),
      semesterId,
    },
    {
      id: applicationTestRecordIds.supplement,
      status: "SUPPLEMENT",
      adminRemark: null,
      targetSchool: null,
      residencyType: "NON_LOCAL",
      name: "测试待补件申请",
      gender: "FEMALE",
      idCard: "110101201201011232",
      studentId: "G2026000002",
      guardian1Name: "待补件监护人",
      guardian1Phone: "13800000002",
      guardian2Name: "",
      guardian2Phone: "",
      currentSchool: "外区第二小学",
      currentGrade: "三年级",
      targetGrade: "四年级",
      hukouAddress: "外区和平路2号",
      livingAddress: "城中区幸福路2号2单元202",
      fileHukou: json(["/seed/supplement-hukou.png"]),
      fileProperty: json(["/seed/supplement-property.png"]),
      fileStudentCard: json([]),
      fileResidencePermit: json(["/seed/supplement-residence-permit.png"]),
      semesterId,
    },
    {
      id: applicationTestRecordIds.approved,
      status: "APPROVED",
      adminRemark: null,
      targetSchool: "城中区第一小学",
      residencyType: "LOCAL",
      name: "测试审核通过申请",
      gender: "MALE",
      idCard: "110101201201011233",
      studentId: "G2026000003",
      guardian1Name: "通过监护人",
      guardian1Phone: "13800000003",
      guardian2Name: "",
      guardian2Phone: "",
      currentSchool: "城中区第三小学",
      currentGrade: "四年级",
      targetGrade: "五年级",
      hukouAddress: "城中区育才路3号",
      livingAddress: "城中区育才路3号3单元303",
      fileHukou: json(["/seed/approved-hukou.png"]),
      fileProperty: json(["/seed/approved-property.png"]),
      fileStudentCard: json(["/seed/approved-student-card.png"]),
      fileResidencePermit: json([]),
      semesterId,
    },
    {
      id: applicationTestRecordIds.rejected,
      status: "REJECTED",
      adminRemark: "提交材料与户籍信息不一致，请核对后重新提交。",
      targetSchool: null,
      residencyType: "LOCAL",
      name: "测试审核驳回申请",
      gender: "FEMALE",
      idCard: "110101201201011234",
      studentId: "G2026000004",
      guardian1Name: "驳回监护人",
      guardian1Phone: "13800000004",
      guardian2Name: "",
      guardian2Phone: "",
      currentSchool: "城中区第四小学",
      currentGrade: "五年级",
      targetGrade: "六年级",
      hukouAddress: "城中区学苑路4号",
      livingAddress: "城中区学苑路4号4单元404",
      fileHukou: json(["/seed/rejected-hukou.png"]),
      fileProperty: json(["/seed/rejected-property.png"]),
      fileStudentCard: json(["/seed/rejected-student-card.png"]),
      fileResidencePermit: json([]),
      semesterId,
    },
  ];
}

async function main() {
  const semester = await getTargetSemester();

  if (!semester) {
    throw new Error("未找到任何学期，请先创建学期后再执行测试申请脚本。");
  }

  const records = buildApplicationRecords(semester.id);

  for (const record of records) {
    await prisma.application.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }

  console.log("测试申请已创建或更新：");
  console.log(JSON.stringify(applicationTestRecordIds, null, 2));
  console.log(`所属学期: ${semester.name} (${semester.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
