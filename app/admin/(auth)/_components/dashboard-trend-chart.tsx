"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardRange } from "./dashboard-data";

const chartConfig = {
  applications: {
    label: "申请量",
    color: "var(--primary)",
  },
  completed: {
    label: "办结量",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function DashboardTrendChart({
  series,
  hasApplications,
}: {
  series: Record<
    DashboardRange,
    Array<{
      date: string;
      label: string;
      applications: number;
      completed: number;
    }>
  >;
  hasApplications: boolean;
}) {
  const [range, setRange] = useState<DashboardRange>("30d");

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>申请趋势</CardTitle>
        <CardDescription>按日期查看申请量与办结量</CardDescription>
        <CardAction>
          <Select
            value={range}
            onValueChange={(value) => setRange(value as DashboardRange)}
          >
            <SelectTrigger className="w-32" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">近 7 天</SelectItem>
              <SelectItem value="30d">近 30 天</SelectItem>
              <SelectItem value="90d">近 90 天</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6">
        {hasApplications ? (
          <ChartContainer className="h-[260px] w-full" config={chartConfig}>
            <AreaChart data={series[range]}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="dot" />}
                cursor={false}
              />
              <Area
                dataKey="applications"
                fill="var(--color-applications)"
                fillOpacity={0.2}
                stroke="var(--color-applications)"
                type="monotone"
              />
              <Area
                dataKey="completed"
                fill="var(--color-completed)"
                fillOpacity={0.18}
                stroke="var(--color-completed)"
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            当前启用学期暂无申请趋势数据
          </div>
        )}
      </CardContent>
    </Card>
  );
}
