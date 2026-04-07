import * as z from "zod";

// 简单的正则准备
const phoneRegex = /^1[3-9]\d{9}$/;
const idCardRegex =
  /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;

export const applicationSchema = z
  .object({
    semesterId: z.string().min(1, "请选择所属学期"),

    // 枚举类型，与 Prisma 中的保持一致
    residencyType: z.enum(["LOCAL", "NON_LOCAL"], {
      message: "请选择户籍类型",
    }),
    name: z.string().min(2, "请输入学生姓名"),
    gender: z.enum(["MALE", "FEMALE"], {
      message: "请选择性别",
    }),
    idCard: z.string().regex(idCardRegex, "身份证号码格式不正确"),
    studentId: z.string().min(4, "请输入正确的学籍号码"),

    guardian1Name: z.string().min(2, "请输入主监护人姓名"),
    guardian1Phone: z.string().regex(phoneRegex, "主监护人手机号格式不正确"),
    // 选填项，但如果填了电话就要校验格式
    guardian2Name: z.string().optional(),
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

    // --- 资料上传区 (在前端表单中它是 Array，提交到数据库时再转为 JSON String) ---
    fileHukou: z.array(z.string()).min(1, "至少上传一张户口本照片"),
    fileProperty: z
      .array(z.string())
      .min(1, "至少上传一张房产证或房屋租赁证明"),
    fileStudentCard: z.array(z.string()).min(1, "至少上传一张学籍信息卡"),
    fileResidencePermit: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    // 核心联动校验：如果是非本地户籍，且没有上传居住证
    if (
      data.residencyType === "NON_LOCAL" &&
      (!data.fileResidencePermit || data.fileResidencePermit.length === 0)
    ) {
      ctx.addIssue({
        code: "custom", // ✅ 直接使用字符串字面量
        message: "非城中区户籍人口必须上传监护人或学生的居住证",
        path: ["fileResidencePermit"],
      });
    }
  });

// 导出前端推导类型
export type ApplicationInput = z.infer<typeof applicationSchema>;
