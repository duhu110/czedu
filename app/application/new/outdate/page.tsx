import { TimerOffIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApplicationOutdatePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm text-center shadow-md animate-in fade-in zoom-in duration-300">
        <CardHeader className="pt-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <TimerOffIcon className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-xl">二维码已失效</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>该二维码已过期或无效，请返回登记处重新扫描最新的二维码。</p>
          <div className="mt-4 rounded-md bg-orange-50 p-3 text-left text-xs text-orange-700">
            <strong>温馨提示：</strong>
            <br />
            为保障申请安全，二维码每 30 秒刷新一次，扫码后请在 3
            分钟内打开页面。如已过期，请联系现场工作人员获取最新二维码。
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
