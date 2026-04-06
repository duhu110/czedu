import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTransferDashboardSummary } from "@/lib/admin/mock-transfer-applications";

export function ApplicationOverviewCards() {
  const summary = getTransferDashboardSummary();

  const cards = [
    {
      title: "申请总数",
      value: summary.total,
      note: "当前系统内全部转学申请记录",
    },
    {
      title: "申请中",
      value: summary.pending,
      note: "等待教育局完成初审",
    },
    {
      title: "待补充资料",
      value: summary.supplementRequired,
      note: "需要通知家长补齐材料",
    },
    {
      title: "审核通过",
      value: summary.approved,
      note: "已通过审核并待学校接收",
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
          <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{card.note}</span>
            <Badge variant="outline">实时 DEMO</Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
