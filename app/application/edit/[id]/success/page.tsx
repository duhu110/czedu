import { CheckCircle2Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EditSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm text-center shadow-md animate-in fade-in zoom-in duration-300">
        <CardHeader className="pt-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2Icon className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl">修改已提交</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 pb-8">
          <p>您的申请信息修改已成功提交，将重新进入审核流程。</p>
          <p>请耐心等待审核结果。</p>
          <div className="mt-4 rounded-md bg-blue-50 p-3 text-left text-xs text-blue-700">
            <strong>温馨提示：</strong>
            <br />
            修改提交后此链接已失效，无法再次使用。如有疑问请联系登记处。
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
