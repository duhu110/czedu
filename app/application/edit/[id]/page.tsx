import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { verifyEditToken } from "@/lib/qrcode-token";
import { getApplicationById } from "@/app/actions/application";
import { REJECTABLE_FIELDS } from "@/lib/validations/application";
import { Badge } from "@/components/ui/badge";
import { EditApplicationForm } from "./_components/edit-application-form";

// 字段路径 → 中文标签映射
const fieldLabelMap = new Map<string, string>();
for (const group of REJECTABLE_FIELDS) {
  for (const f of group.fields) {
    fieldLabelMap.set(f.field, f.label);
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditApplicationPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : undefined;
  const sig = typeof sp.sig === "string" ? sp.sig : undefined;

  // 1. 验证参数存在
  if (!token || !sig) {
    return <InvalidPage reason="missing_params" />;
  }

  // 2. 验证 HMAC 签名
  const result = verifyEditToken(id, sig);
  if (!result.valid) {
    return <InvalidPage reason="invalid_signature" />;
  }

  // 3. 查询申请单
  const res = await getApplicationById(id);
  if (!res.data) {
    notFound();
  }

  const app = res.data;

  // 4. 检查状态
  if (app.status !== "EDITING") {
    return <InvalidPage reason="not_editing" />;
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 shadow-sm">
        <h1 className="text-center text-lg font-bold">修改转学申请信息</h1>
        <p className="text-center text-xs text-muted-foreground mt-1">
          {app.name} 的转学申请
        </p>
      </header>

      <main className="mx-auto max-w-md p-4 space-y-4">
        {/* 审核备注 */}
        {app.adminRemark && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-4 text-orange-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  审核人员备注
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  {app.adminRemark}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 需要修改的字段列表 */}
        {app.rejectedFields.length > 0 && (
          <div className="rounded-lg border bg-background p-4">
            <p className="text-sm font-medium mb-2">
              以下信息需要修改（标红的字段）：
            </p>
            <div className="flex flex-wrap gap-1.5">
              {app.rejectedFields.map((field) => (
                <Badge
                  key={field}
                  variant="outline"
                  className="text-xs border-orange-300 text-orange-700"
                >
                  {fieldLabelMap.get(field) || field}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 编辑表单 */}
        <EditApplicationForm
          application={app}
          rejectedFields={app.rejectedFields}
        />
      </main>
    </div>
  );
}

function InvalidPage({ reason }: { reason: string }) {
  const messages: Record<string, { title: string; desc: string }> = {
    missing_params: {
      title: "链接无效",
      desc: "缺少必要的安全参数，请从二维码重新扫描。",
    },
    invalid_signature: {
      title: "链接无效",
      desc: "安全签名验证失败，请确认二维码来源正确。",
    },
    not_editing: {
      title: "链接已失效",
      desc: "该申请的修改已提交或状态已变更，此链接不再有效。",
    },
  };
  const msg = messages[reason] || messages.missing_params;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <AlertTriangle className="size-8 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold">{msg.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        {msg.desc}
      </p>
    </div>
  );
}
