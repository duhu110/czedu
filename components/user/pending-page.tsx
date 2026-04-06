"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockApplicationId, mockBasicInfo } from "@/lib/transfer-mock";
import {
  Clock,
  CheckCircle2,
  FileText,
  Bell,
  ArrowRight,
  Loader2,
} from "lucide-react";

export function PendingPage() {
  const timeline = [
    {
      title: "提交申请",
      time: "刚刚",
      status: "completed",
      description: "您的转学申请已成功提交",
    },
    {
      title: "资料审核中",
      time: "预计1-3个工作日",
      status: "current",
      description: "学校正在审核您的基本资料",
    },
    {
      title: "确认结果",
      time: "待定",
      status: "pending",
      description: "审核通过后需确认并补充材料",
    },
    {
      title: "完成转学",
      time: "待定",
      status: "pending",
      description: "材料齐全后完成转学手续",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-6">
        <h1 className="text-xl font-bold text-primary-foreground">审核中</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">
          请耐心等待审核结果
        </p>
      </div>

      {/* Status Card */}
      <div className="px-4 -mt-3">
        <Card className="overflow-hidden">
          <div className="bg-warning/10 px-4 py-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-warning animate-spin" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">申请审核中</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                预计1-3个工作日内完成审核
              </p>
            </div>
          </div>
          <CardContent className="pt-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">申请人</span>
                <span className="font-medium text-foreground">
                  {mockBasicInfo.studentName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">学籍号</span>
                <span className="font-medium text-foreground">
                  {mockBasicInfo.studentId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">目标学校</span>
                <span className="font-medium text-foreground">
                  {mockBasicInfo.targetSchool}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">申请编号</span>
                <span className="font-medium text-primary">
                  {mockApplicationId}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold text-foreground mb-4">申请进度</h3>
        <div className="space-y-0">
          {timeline.map((item, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.status === "completed"
                      ? "bg-success text-success-foreground"
                      : item.status === "current"
                        ? "bg-warning text-warning-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : item.status === "current" ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                {index < timeline.length - 1 && (
                  <div
                    className={`w-0.5 h-16 ${
                      item.status === "completed" ? "bg-success" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-medium ${
                      item.status === "pending"
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="px-4 mt-4">
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground text-sm">
                  温馨提示
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  审核结果将通过短信和邮件通知您，请保持通讯畅通。如有疑问，请联系学校招生办：400-123-4567
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Button */}
      <div className="px-4 mt-6">
        <Button asChild className="w-full h-12 gap-2">
          <Link href="/user/confirmation">
            <FileText className="w-4 h-4" />
            查看审核结果
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          当前为 Mock 页面，按钮将直接进入确认结果页
        </p>
      </div>
    </div>
  );
}
