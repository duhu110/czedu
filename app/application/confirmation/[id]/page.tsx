"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockBasicInfo, mockConfirmedNotices } from "../../_mock-data";
import {
  CheckCircle2,
  FileText,
  Eye,
  ArrowRight,
  AlertCircle,
  BookOpen,
} from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  required: boolean;
}

const notices: Notice[] = [
  {
    id: "enrollment",
    title: "转学入学须知",
    content: `一、报到时间
请于收到录取通知后7个工作日内到校报到，逾期将视为自动放弃入学资格。

二、报到地点
学校招生办公室（行政楼一楼102室）

三、报到材料
1. 原学校出具的转学证明原件
2. 学籍档案（密封）
3. 户口簿原件及复印件
4. 监护人身份证原件及复印件
5. 近期一寸免冠照片4张
6. 体检报告（三个月内有效）

四、缴费说明
1. 学费按学期收取，具体标准以学校公示为准
2. 支持银行转账、微信、支付宝等多种支付方式
3. 请在报到时一并缴纳相关费用

五、其他事项
1. 学校将为新转入学生安排适应性辅导
2. 如有特殊情况无法按时报到，请提前联系招生办`,
    required: true,
  },
  {
    id: "discipline",
    title: "学校规章制度",
    content: `一、考勤制度
1. 学生应按时到校，不迟到、不早退、不旷课
2. 因病因事需请假，须提前向班主任申请
3. 连续旷课三天或累计旷课五天，学校将与家长联系

二、课堂纪律
1. 上课铃响后，学生应安静就座，做好上课准备
2. 上课期间专心听讲，积极参与课堂活动
3. 未经老师允许，不得随意离开座位或教室

三、校园行为规范
1. 尊重师长，团结同学，使用文明用语
2. 爱护公共设施，保持校园环境整洁
3. 不携带手机等电子设备进入校园（特殊情况需申请）
4. 穿着校服，仪表整洁大方

四、安全须知
1. 不在走廊、楼梯追逐打闹
2. 遵守实验室、体育场等场所的安全规定
3. 发现安全隐患及时向老师报告

五、违规处理
违反校规校纪者，学校将视情节轻重给予相应处分`,
    required: true,
  },
  {
    id: "privacy",
    title: "个人信息保护协议",
    content: `本协议根据《中华人民共和国个人信息保护法》相关规定制定。

一、信息收集范围
学校将收集以下学生及家长信息：
1. 基本身份信息（姓名、身份证号、户籍地址等）
2. 联系方式（电话、邮箱、通讯地址等）
3. 学业信息（成绩、奖惩记录、综合评价等）
4. 健康信息（体检报告、特殊疾病史等）

二、信息使用目的
1. 学籍管理和日常教育教学活动
2. 学生安全管理和紧急联络
3. 教育行政部门要求的统计报送
4. 升学、评优等相关工作

三、信息保护措施
1. 建立完善的信息安全管理制度
2. 采取技术措施防止信息泄露
3. 严格限制信息访问权限
4. 定期进行安全检查和风险评估

四、信息共享
未经学生及家长同意，学校不会将个人信息提供给第三方，但以下情况除外：
1. 法律法规要求
2. 教育行政部门依法要求
3. 涉及学生人身安全的紧急情况

五、权利保障
学生及家长有权查询、更正、删除相关个人信息，如有疑问请联系学校信息管理部门。`,
    required: true,
  },
  {
    id: "fee",
    title: "收费项目说明",
    content: `一、学费（按学期收取）
根据市教育局核定标准执行，具体金额请参见学校收费公示栏。

二、住宿费（如适用）
1. 6人间：800元/学期
2. 4人间：1200元/学期
3. 包含水电费基本额度

三、代收代管费
1. 教材费：按实际发生金额收取
2. 校服费：夏装两套、春秋装两套、冬装一套
3. 保险费：学生平安险（自愿购买）

四、餐费（自愿选择）
1. 早餐：8元/天
2. 午餐：15元/天
3. 晚餐：12元/天
4. 按月预缴，多退少补

五、缴费方式
1. 银行转账（推荐）
2. 学校财务处现场缴费
3. 微信/支付宝扫码支付

六、退费说明
1. 开学前申请退学，全额退费
2. 开学后一个月内，退还剩余部分
3. 超过一个月按相关规定执行

七、助学政策
符合条件的学生可申请国家助学金、学校奖学金等，详情请咨询学生资助中心。`,
    required: false,
  },
];

export default function ApplicationConfirmationPage() {
  const router = useRouter();
  const [currentNotice, setCurrentNotice] = useState<Notice | null>(null);
  const [confirmedNotices, setConfirmedNotices] =
    useState<string[]>(mockConfirmedNotices);
  const [readNotices, setReadNotices] = useState<Set<string>>(new Set());

  const handleReadNotice = (notice: Notice) => {
    setCurrentNotice(notice);
  };

  const handleCloseDialog = () => {
    if (currentNotice) {
      setReadNotices((prev) => new Set(prev).add(currentNotice.id));
    }
    setCurrentNotice(null);
  };

  const handleConfirmNotice = (noticeId: string, checked: boolean) => {
    if (checked) {
      setConfirmedNotices([...confirmedNotices, noticeId]);
    } else {
      setConfirmedNotices(confirmedNotices.filter((id) => id !== noticeId));
    }
  };

  const requiredNotices = notices.filter((n) => n.required);
  const allRequiredConfirmed = requiredNotices.every((n) =>
    confirmedNotices.includes(n.id),
  );
  const canProceed = allRequiredConfirmed;

  const handleProceed = () => {
    if (canProceed) {
      router.push("/application/supplement");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-6">
        <h1 className="text-xl font-bold text-primary-foreground">确认结果</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">
          请仔细阅读并确认以下须知
        </p>
      </div>

      {/* Success Card */}
      <div className="px-4 -mt-3">
        <Card className="overflow-hidden">
          <div className="bg-success/10 px-4 py-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-success" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">审核通过</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                恭喜！您的转学申请已通过初审
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
                <span className="text-muted-foreground">录取学校</span>
                <span className="font-medium text-primary">
                  {mockBasicInfo.targetSchool}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">录取年级</span>
                <span className="font-medium text-foreground">
                  {mockBasicInfo.targetGrade}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notices */}
      <div className="px-4 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">确认须知</h3>
          <span className="text-xs text-muted-foreground">
            （已确认 {confirmedNotices.length}/{notices.length}）
          </span>
        </div>

        <div className="space-y-3">
          {notices.map((notice) => {
            const isRead = readNotices.has(notice.id);
            const isConfirmed = confirmedNotices.includes(notice.id);

            return (
              <Card
                key={notice.id}
                className={`transition-colors ${isConfirmed ? "border-success/50 bg-success/5" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={notice.id}
                      checked={isConfirmed}
                      onCheckedChange={(checked) =>
                        handleConfirmNotice(notice.id, checked as boolean)
                      }
                      disabled={!isRead}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={notice.id}
                          className="font-medium text-foreground text-sm cursor-pointer flex items-center gap-2"
                        >
                          {notice.title}
                          {notice.required && (
                            <span className="text-xs text-destructive">
                              *必读
                            </span>
                          )}
                        </label>
                        {isConfirmed && (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isRead ? "已阅读，可勾选确认" : "请先阅读全文后再确认"}
                      </p>
                      <Dialog
                        open={currentNotice?.id === notice.id}
                        onOpenChange={(open) => !open && handleCloseDialog()}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-2 text-primary"
                            onClick={() => handleReadNotice(notice)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            {isRead ? "再次阅读" : "阅读全文"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[90vw] max-h-[80vh] p-0">
                          <DialogHeader className="p-4 pb-0">
                            <DialogTitle className="text-base flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              {notice.title}
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                              阅读并确认{notice.title}
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="h-[60vh] px-4">
                            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed pb-4">
                              {notice.content}
                            </div>
                          </ScrollArea>
                          <div className="p-4 pt-0">
                            <Button
                              onClick={handleCloseDialog}
                              className="w-full"
                            >
                              我已阅读
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Warning */}
      {!canProceed && (
        <div className="px-4 mt-4">
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground text-sm">
                    请完成所有必读须知
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    您需要阅读并确认所有标记为&quot;必读&quot;的须知后才能继续
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Button */}
      <div className="px-4 mt-6">
        <Button
          onClick={handleProceed}
          disabled={!canProceed}
          className="w-full h-12 gap-2"
        >
          确认并补充材料
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          当前为独立 Mock 页面，满足条件后将跳转到补充材料页
        </p>
      </div>
    </div>
  );
}
