import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardOverviewCards({
  semesterName,
  stats,
}: {
  semesterName: string;
  stats: {
    total: number;
    pending: number;
    supplementRequired: number;
    approved: number;
  };
}) {
  const cards = [
    {
      title: "申请总数",
      value: stats.total,
      note: "当前启用学期内全部转学申请记录",
    },
    {
      title: "待审核",
      value: stats.pending,
      note: "等待管理员完成审核处理",
    },
    {
      title: "待补学籍信息卡",
      value: stats.supplementRequired,
      note: "需要通知家长补齐材料",
    },
    {
      title: "审核通过",
      value: stats.approved,
      note: "已通过并完成目标学校分配",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-3xl">{card.value}</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>{card.note}</span>
            <Badge variant="outline">{semesterName}</Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
