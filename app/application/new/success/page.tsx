import { CheckCircle2Icon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApplicationSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm text-center shadow-md animate-in fade-in zoom-in duration-300">
        <CardHeader className="pt-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2Icon className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl">申请提交成功</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>您的转学申请已成功创建并提交至系统后台。</p>
          <p>
            如果暂未上传学籍信息卡，申请会先进入“待补学籍信息卡”状态，后续补齐后再转为正式审核。
          </p>
          <div className="mt-4 rounded-md bg-blue-50 p-3 text-left text-xs text-blue-700">
            <strong>温馨提示：</strong>
            <br />
            后续您可以通过申请单二维码或申请页面中的状态入口查看最新进度。
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
