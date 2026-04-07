import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
          <p>您的转学申请资料已成功提交至系统后台。</p>
          <p>教育局和学校工作人员将尽快进行联合审核，请保持监护人手机畅通。</p>
          <div className="mt-4 rounded-md bg-blue-50 p-3 text-left text-xs text-blue-700">
            <strong>温馨提示：</strong>
            <br />
            后续您可以通过申请页面的“结果查询”入口，输入学生身份证号获取最新审核进度。
          </div>
        </CardContent>
        <CardFooter className="pb-8">
          {/* 在微信/移动端，通常引导用户关闭页面或返回首页 */}
          <Button asChild className="w-full">
            <Link href="/">我知道了，返回首页</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
