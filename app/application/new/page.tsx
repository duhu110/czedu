import prisma from "@/lib/prisma";
import { ApplicationForm } from "./_components/application-form";

export default async function NewApplicationPage() {
  const now = new Date();

  // 查找当前时间处于起止范围内的学期
  const activeSemester = await prisma.semester.findFirst({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  if (!activeSemester) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <span className="text-4xl">📴</span>
        </div>
        <h1 className="text-xl font-bold">转学申请通道暂未开放</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          当前不在规定的转学申请时间范围内，请关注教育局最新通知。
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      {/* 简单的移动端头部 */}
      <header className="sticky top-0 z-10 bg-background px-4 py-4 shadow-sm">
        <h1 className="text-center text-lg font-bold">城中区学生转学申请表</h1>
        <p className="text-center text-xs text-muted-foreground mt-1">
          当前学期：{activeSemester.name}
        </p>
      </header>

      <main className="mx-auto max-w-md p-4">
        {/* 将获取到的学期 ID 传给客户端表单 */}
        <ApplicationForm semesterId={activeSemester.id} />
      </main>
    </div>
  );
}
