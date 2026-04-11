import { z } from "zod";

// ── 文字类型枚举 ──

export const systemTextTypeEnum = z.enum(["TRANSFER_NOTICE", "CONSENT_FORM"]);

export type SystemTextType = z.infer<typeof systemTextTypeEnum>;

export const SYSTEM_TEXT_TYPES = systemTextTypeEnum.options;

export const systemTextTypeMap: Record<
  SystemTextType,
  { label: string; description: string }
> = {
  TRANSFER_NOTICE: {
    label: "转学须知",
    description: "学生收到录取通知后需确认的转学相关注意事项",
  },
  CONSENT_FORM: {
    label: "知情同意书",
    description: "学生和家长需要阅读并签署确认的知情同意内容",
  },
};

// ── 表单验证 ──

export const systemTextFormSchema = z.object({
  semesterId: z.string().min(1, "请选择所属学期"),
  type: systemTextTypeEnum,
  content: z.string().min(1, "请输入文字内容"),
});

export type SystemTextFormInput = z.infer<typeof systemTextFormSchema>;
