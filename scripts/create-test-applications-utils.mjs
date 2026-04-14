import { randomUUID } from "node:crypto";

const applicationTestRecordIds = {
  pending: "test-application-pending",
  supplement: "test-application-supplement",
  approved: "test-application-approved",
  rejected: "test-application-rejected",
};

const surnames = ["张", "王", "李", "赵", "刘", "陈", "杨", "黄"];
const givenNames = [
  "子涵",
  "梓睿",
  "雨桐",
  "浩然",
  "佳怡",
  "宇轩",
  "思源",
  "欣妍",
];
const ethnicities = ["汉族", "回族", "藏族", "土族", "撒拉族"];
const currentSchools = [
  "城中区实验小学",
  "城中区第一小学",
  "城中区第二小学",
  "南川东路小学",
  "西关街小学",
  "晓泉小学",
];
const targetSchools = [
  "城中区第一小学",
  "城中区第二小学",
  "西关街小学",
  "南川西路小学",
];
const grades = ["一年级", "二年级", "三年级", "四年级", "五年级"];
const streets = [
  "光明路",
  "幸福路",
  "育才路",
  "长江路",
  "南关街",
  "学苑路",
  "昆仑中路",
];
const guardianRelations = ["父亲", "母亲", "爷爷", "奶奶", "外公", "外婆"];
const statusPool = ["PENDING", "SUPPLEMENT", "APPROVED", "REJECTED", "EDITING"];
const propertyTypes = ["PURCHASE", "RENT"];

function json(value) {
  return JSON.stringify(value);
}

function pickIndex(length, random) {
  return Math.floor(random() * length) % length;
}

function pickOne(items, random) {
  return items[pickIndex(items.length, random)];
}

function pickMany(items, count, random) {
  return Array.from({ length: count }, () => pickOne(items, random));
}

function pad(value, length) {
  return String(value).padStart(length, "0");
}

function buildIdCard(index, random) {
  const birthYear = 2014 + (index % 5);
  const month = pad(pickIndex(12, random) + 1, 2);
  const day = pad(pickIndex(28, random) + 1, 2);
  const sequence = pad(index + 11, 3);
  return `630103${birthYear}${month}${day}${sequence}`;
}

function buildStudentId(index) {
  return `G2026${pad(index + 1, 6)}`;
}

function buildAddress(random) {
  const street = pickOne(streets, random);
  const building = pickIndex(40, random) + 1;
  const unit = pickIndex(6, random) + 1;
  const room = pad(pickIndex(28, random) + 1, 2);
  return `城中区${street}${building}号${unit}单元${room}01`;
}

function buildApplicantName(random) {
  return `${pickOne(surnames, random)}${pickOne(givenNames, random)}`;
}

function buildGuardianName(studentName, relation) {
  return `${studentName[0]}${relation === "父亲" ? "先生" : "女士"}`;
}

function buildPhone(index) {
  return `138${pad(10000000 + index, 8)}`;
}

function buildFilePayloads(uploadPaths, residencyType, status, random) {
  const hukouImages = pickMany(uploadPaths, 5, random);
  const propertyImages = pickMany(uploadPaths, 3, random);
  const studentCardImages =
    status === "SUPPLEMENT" ? [] : pickMany(uploadPaths, 1, random);
  const residencePermitImages =
    residencyType === "NON_LOCAL" ? pickMany(uploadPaths, 2, random) : [];

  return {
    fileHukou: json({
      frontPage: hukouImages[0],
      householderPage: hukouImages[1],
      guardianPage: hukouImages[2],
      studentPage: hukouImages[3],
      others: hukouImages[4] ? [hukouImages[4]] : [],
    }),
    fileProperty: json({
      propertyDeed: propertyImages[0],
      purchaseContract: propertyImages[1],
      rentalCert: propertyImages[2],
      others: [],
    }),
    fileStudentCard: json(studentCardImages),
    fileResidencePermit: json(residencePermitImages),
  };
}

function buildAdminFields(status, random) {
  if (status === "APPROVED") {
    return {
      adminRemark: "材料审核通过，已纳入统筹分配。",
      targetSchool: pickOne(targetSchools, random),
      rejectedFields: json([]),
    };
  }

  if (status === "REJECTED") {
    return {
      adminRemark: "提交材料信息不完整，请重新核对后再提交。",
      targetSchool: null,
      rejectedFields: json([]),
    };
  }

  if (status === "EDITING") {
    return {
      adminRemark: "部分证件页不清晰，请按提示修改后重新提交。",
      targetSchool: null,
      rejectedFields: json(["fileHukou.guardianPage", "livingAddress"]),
    };
  }

  if (status === "SUPPLEMENT") {
    return {
      adminRemark: "请补充学生学籍信息卡。",
      targetSchool: null,
      rejectedFields: json([]),
    };
  }

  return {
    adminRemark: null,
    targetSchool: null,
    rejectedFields: json([]),
  };
}

function buildBaseRecord({
  id,
  status,
  residencyType,
  semesterId,
  index,
  random,
  uploadPaths,
}) {
  const name = buildApplicantName(random);
  const guardian1Relation = pickOne(guardianRelations, random);
  const guardian2Enabled = random() > 0.55;
  const guardian2Relation = guardian2Enabled
    ? pickOne(guardianRelations, random)
    : null;
  const currentGrade = pickOne(grades, random);
  const currentGradeIndex = grades.indexOf(currentGrade);
  const targetGrade =
    grades[Math.min(currentGradeIndex + 1, grades.length - 1)] ?? currentGrade;
  const residency = residencyType ?? (random() > 0.5 ? "LOCAL" : "NON_LOCAL");
  const propertyType = pickOne(propertyTypes, random);
  const files = buildFilePayloads(uploadPaths, residency, status, random);
  const adminFields = buildAdminFields(status, random);
  const hukouAddress = buildAddress(random);
  const livingAddress =
    residency === "LOCAL" ? hukouAddress : buildAddress(random);

  return {
    id,
    status,
    semesterId,
    residencyType: residency,
    propertyType,
    name,
    gender: random() > 0.5 ? "MALE" : "FEMALE",
    ethnicity: pickOne(ethnicities, random),
    idCard: buildIdCard(index, random),
    studentId: buildStudentId(index),
    guardian1Name: buildGuardianName(name, guardian1Relation),
    guardian1Relation,
    guardian1Phone: buildPhone(index),
    guardian2Name: guardian2Enabled ? buildGuardianName(name, guardian2Relation) : "",
    guardian2Relation: guardian2Relation ?? "",
    guardian2Phone: guardian2Enabled ? buildPhone(index + 300) : "",
    currentSchool: pickOne(currentSchools, random),
    currentGrade,
    targetGrade,
    hukouAddress,
    livingAddress,
    ...files,
    ...adminFields,
  };
}

export function buildApplicationSeedRecords({
  semesterId,
  uploadPaths,
  count = 6,
  random = Math.random,
}) {
  if (!uploadPaths.length) {
    throw new Error("未找到可用的上传图片");
  }

  const stableRecords = [
    buildBaseRecord({
      id: applicationTestRecordIds.pending,
      status: "PENDING",
      residencyType: "LOCAL",
      semesterId,
      index: 0,
      random,
      uploadPaths,
    }),
    buildBaseRecord({
      id: applicationTestRecordIds.supplement,
      status: "SUPPLEMENT",
      residencyType: "NON_LOCAL",
      semesterId,
      index: 1,
      random,
      uploadPaths,
    }),
    buildBaseRecord({
      id: applicationTestRecordIds.approved,
      status: "APPROVED",
      residencyType: "LOCAL",
      semesterId,
      index: 2,
      random,
      uploadPaths,
    }),
    buildBaseRecord({
      id: applicationTestRecordIds.rejected,
      status: "REJECTED",
      residencyType: "NON_LOCAL",
      semesterId,
      index: 3,
      random,
      uploadPaths,
    }),
  ];

  const randomRecords = Array.from({ length: Math.max(0, count) }, (_, offset) =>
    buildBaseRecord({
      id: `test-application-random-${randomUUID()}`,
      status: pickOne(statusPool, random),
      residencyType: null,
      semesterId,
      index: offset + stableRecords.length,
      random,
      uploadPaths,
    }),
  );

  return [...stableRecords, ...randomRecords];
}

export function parseSeedCountArg(argv) {
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (/^\d+$/.test(current)) {
      return Number.parseInt(current, 10);
    }

    if (current === "--count") {
      const nextValue = Number.parseInt(argv[index + 1] ?? "", 10);
      if (!Number.isInteger(nextValue) || nextValue < 0) {
        throw new Error("参数 --count 需要提供大于等于 0 的整数。");
      }
      return nextValue;
    }

    if (current.startsWith("--count=")) {
      const nextValue = Number.parseInt(current.slice("--count=".length), 10);
      if (!Number.isInteger(nextValue) || nextValue < 0) {
        throw new Error("参数 --count 需要提供大于等于 0 的整数。");
      }
      return nextValue;
    }
  }

  return 6;
}
