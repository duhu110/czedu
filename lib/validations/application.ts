import * as z from "zod";

// 简单的正则准备
const phoneRegex = /^1[3-9]\d{9}$/;
const idCardRegex =
  /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
// 姓名：2-20个汉字，允许少数民族姓名中的中间点（·）
const chineseNameRegex = /^[\u4e00-\u9fa5][\u4e00-\u9fa5·]{0,18}[\u4e00-\u9fa5]$/;
// 全国学籍号：以 G 或 L 开头，后跟18位数字（或纯数字格式）
const studentIdRegex = /^[GL]?\d{10,19}$/;
const optionalTrimmedString = z.preprocess(
  (value) =>
    typeof value === "string" ? (value.trim() || undefined) : value,
  z.string().optional(),
);

// 年级选项
export const GRADE_OPTIONS = [
  "一年级", "二年级", "三年级", "四年级", "五年级", "六年级",
  "七年级", "八年级", "九年级",
] as const;

// 监护人关系选项
export const GUARDIAN_RELATION_OPTIONS = [
  "父亲", "母亲", "爷爷", "奶奶", "外公", "外婆", "其他",
] as const;

// 中国56个民族
export const ETHNICITY_OPTIONS = [
  "汉族", "蒙古族", "回族", "藏族", "维吾尔族", "苗族", "彝族", "壮族",
  "布依族", "朝鲜族", "满族", "侗族", "瑶族", "白族", "土家族", "哈尼族",
  "哈萨克族", "傣族", "黎族", "傈僳族", "佤族", "畲族", "高山族", "拉祜族",
  "水族", "东乡族", "纳西族", "景颇族", "柯尔克孜族", "土族", "达斡尔族",
  "仫佬族", "羌族", "布朗族", "撒拉族", "毛南族", "仡佬族", "锡伯族",
  "阿昌族", "普米族", "塔吉克族", "怒族", "乌孜别克族", "俄罗斯族",
  "鄂温克族", "德昂族", "保安族", "裕固族", "京族", "塔塔尔族", "独龙族",
  "鄂伦春族", "赫哲族", "门巴族", "珞巴族", "基诺族",
] as const;

// 可驳回字段定义（按分组，用于驳回修改对话框的复选框渲染）
export const REJECTABLE_FIELDS = [
  {
    group: "学生基本信息",
    fields: [
      { field: "name", label: "姓名" },
      { field: "gender", label: "性别" },
      { field: "ethnicity", label: "民族" },
      { field: "idCard", label: "身份证号码" },
      { field: "studentId", label: "全国学籍号码" },
    ],
  },
  {
    group: "户籍信息",
    fields: [
      { field: "residencyType", label: "户籍类型" },
      { field: "hukouAddress", label: "户籍详细地址" },
      { field: "livingAddress", label: "现居住详细地址" },
    ],
  },
  {
    group: "监护人信息",
    fields: [
      { field: "guardian1Name", label: "监护人1姓名" },
      { field: "guardian1Relation", label: "监护人1与学生关系" },
      { field: "guardian1Phone", label: "监护人1手机号码" },
      { field: "guardian2Name", label: "监护人2姓名" },
      { field: "guardian2Relation", label: "监护人2与学生关系" },
      { field: "guardian2Phone", label: "监护人2手机号码" },
    ],
  },
  {
    group: "转学信息",
    fields: [
      { field: "currentSchool", label: "当前就读学校" },
      { field: "currentGrade", label: "当前就读年级" },
      { field: "targetGrade", label: "申请转入年级" },
    ],
  },
  {
    group: "户口簿",
    fields: [
      { field: "fileHukou.frontPage", label: "户口簿首页" },
      { field: "fileHukou.householderPage", label: "户口簿户主页" },
      { field: "fileHukou.guardianPage", label: "户口簿监护人页" },
      { field: "fileHukou.studentPage", label: "户口簿学生页" },
      { field: "fileHukou.others", label: "户口簿其他页面" },
    ],
  },
  {
    group: "住房证明",
    fields: [
      { field: "fileProperty.propertyDeed", label: "不动产权证" },
      { field: "fileProperty.purchaseContract", label: "购房合同" },
      { field: "fileProperty.rentalCert", label: "房屋租赁备案证明" },
      { field: "fileProperty.others", label: "其他住房证明" },
    ],
  },
  {
    group: "学籍信息表",
    fields: [
      { field: "fileStudentCard", label: "学生学籍信息表" },
    ],
  },
  {
    group: "居住证",
    condition: "NON_LOCAL" as const,
    fields: [
      { field: "fileResidencePermit", label: "监护人及学生居住证" },
    ],
  },
] as const;

// 户口簿结构化 schema
const fileHukouSchema = z.object({
  frontPage: z.string().min(1, "请上传户口簿首页"),
  householderPage: z.string().min(1, "请上传户主页"),
  guardianPage: z.string().min(1, "请上传法定监护人页"),
  studentPage: z.string().min(1, "请上传学生页"),
  others: z.array(z.string()).max(3),
});

// 住房证明结构化 schema
const filePropertySchema = z.object({
  propertyDeed: z.string(),
  purchaseContract: z.string(),
  rentalCert: z.string(),
  others: z.array(z.string()).max(3),
});

export const applicationSchema = z
  .object({
    semesterId: z.string().min(1, "请选择所属学期"),

    // 枚举类型，与 Prisma 中的保持一致
    residencyType: z.enum(["LOCAL", "NON_LOCAL"], {
      message: "请选择户籍类型",
    }),
    name: z.string().min(2, "请输入学生姓名").regex(chineseNameRegex, "姓名只能包含汉字和间隔号（·）"),
    gender: z.enum(["MALE", "FEMALE"], {
      message: "请选择性别",
    }),
    ethnicity: z.string().min(1, "请选择民族"),
    idCard: z.string().regex(idCardRegex, "身份证号码格式不正确"),
    studentId: z.string().regex(studentIdRegex, "学籍号格式不正确，通常以G或L开头加数字"),

    guardian1Name: z.string().min(2, "请输入主监护人姓名").regex(chineseNameRegex, "姓名只能包含汉字和间隔号（·）"),
    guardian1Relation: z.string().min(1, "请选择与学生的关系"),
    guardian1Phone: z.string().regex(phoneRegex, "主监护人手机号格式不正确"),
    // 选填项，但如果填了电话就要校验格式
    guardian2Name: z.string().optional().refine(
      (val) => !val || chineseNameRegex.test(val),
      { message: "姓名只能包含汉字和间隔号（·）" },
    ),
    guardian2Relation: z.string().optional(),
    guardian2Phone: z
      .string()
      .optional()
      .refine((val) => !val || phoneRegex.test(val), {
        message: "次监护人手机号格式不正确",
      }),

    currentSchool: z.string().min(2, "请输入当前就读学校"),
    currentGrade: z.string().min(1, "请输入当前年级"),
    targetGrade: z.string().min(1, "请输入申请转入年级"),

    hukouAddress: z.string().min(5, "请输入详细的户籍地址"),
    livingAddress: z.string().min(5, "请输入详细的居住地址"),

    // --- 资料上传区 ---
    fileHukou: fileHukouSchema,
    fileProperty: filePropertySchema.optional(),
    fileStudentCard: z.array(z.string()).optional(),
    fileResidencePermit: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    // 所有户籍类型都必须上传住房证明（至少一项）
    const fp = data.fileProperty;
    if (
      !fp ||
      (!fp.propertyDeed && !fp.purchaseContract && !fp.rentalCert)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "请至少上传一项住房证明（不动产权证、购房合同或房屋租赁备案证明）",
        path: ["fileProperty"],
      });
    }
  });

export const applicationSupplementSchema = z.object({
  fileStudentCard: z.array(z.string()).min(1, "至少上传一张学籍信息卡"),
});

export const applicationApprovalSchema = z
  .object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUPPLEMENT", "EDITING"]),
    adminRemark: optionalTrimmedString,
    targetSchool: optionalTrimmedString,
    rejectedFields: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "APPROVED" && !data.targetSchool) {
      ctx.addIssue({
        code: "custom",
        message: "通过申请时必须指定目标学校",
        path: ["targetSchool"],
      });
    }

    if (
      (data.status === "REJECTED" || data.status === "SUPPLEMENT") &&
      !data.adminRemark
    ) {
      ctx.addIssue({
        code: "custom",
        message: "驳回或要求补充资料时必须填写审核备注",
        path: ["adminRemark"],
      });
    }

    if (data.status === "EDITING") {
      if (!data.rejectedFields || data.rejectedFields.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "驳回修改时必须选择至少一个需要修改的字段",
          path: ["rejectedFields"],
        });
      }
      if (!data.adminRemark) {
        ctx.addIssue({
          code: "custom",
          message: "驳回修改时必须填写审核备注",
          path: ["adminRemark"],
        });
      }
    }
  });

// 导出类型
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type FileHukouInput = z.infer<typeof fileHukouSchema>;
export type FilePropertyInput = z.infer<typeof filePropertySchema>;
export type ApplicationSupplementInput = z.infer<
  typeof applicationSupplementSchema
>;
export type ApplicationApprovalInput = z.infer<typeof applicationApprovalSchema>;
