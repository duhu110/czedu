import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EditInvalidPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm text-center shadow-md">
        <CardHeader className="pt-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">链接无效或已失效</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 pb-8">
          <p>此编辑链接无法使用，可能的原因：</p>
          <ul className="text-left space-y-1 mt-2">
            <li>- 链接参数不完整或被篡改</li>
            <li>- 修改已提交，链接自动失效</li>
            <li>- 申请状态已被管理员变更</li>
          </ul>
          <p className="mt-3">如需修改请联系登记处重新生成二维码。</p>
        </CardContent>
      </Card>
    </div>
  );
}
