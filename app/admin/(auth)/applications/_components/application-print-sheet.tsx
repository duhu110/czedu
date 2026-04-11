"use client";

import { usePrintContext } from "./print-context";
import {
  getFallbackText,
  getGenderLabel,
  getResidencyTypeLabel,
  getStatusPrintLabel,
  maskPhoneNumber,
  type PrintableApplication,
} from "./application-print-utils";

type ApplicationPrintSheetProps = {
  application: PrintableApplication;
  printTimeLabel: string;
  qrCodeDataUrl?: string | null;
  transferNoticeContent: string | null;
  consentFormContent: string | null;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-1 border-b border-black/20 py-1">
      <span className="font-medium text-[10px]">{label}</span>
      <span className="text-[11px]">{value}</span>
    </div>
  );
}

export function ApplicationPrintSheet({
  application,
  printTimeLabel,
  qrCodeDataUrl,
  transferNoticeContent,
  consentFormContent,
}: ApplicationPrintSheetProps) {
  const { maskPhone } = usePrintContext();

  const phone1 = maskPhone
    ? maskPhoneNumber(application.guardian1Phone)
    : application.guardian1Phone;
  const phone2 = application.guardian2Phone
    ? maskPhone
      ? maskPhoneNumber(application.guardian2Phone)
      : application.guardian2Phone
    : null;

  const statusLabel = getStatusPrintLabel(
    application.status,
    application.adminRemark,
  );

  return (
    <section className="hidden print:block print:px-2 print:py-1" data-testid="print-sheet">
      <div className="mx-auto max-w-[794px] border border-black px-4 py-3 text-[11px] leading-relaxed text-black">
        {/* Header */}
        <header className="border-b border-black pb-2 text-center">
          <h1 className="text-lg font-bold">城中区教育局转学申请单</h1>
          <p className="mt-0.5 text-xs">{application.semester.name}</p>
          <div className="mt-1 flex justify-between text-[10px]">
            <span>申请编号：{application.id}</span>
            <span>打印时间：{printTimeLabel}</span>
          </div>
        </header>

        {/* Row 1: 学生基本信息 */}
        <section className="mt-2" data-testid="print-row-1">
          <h2 className="border-b border-black pb-1 text-xs font-semibold">
            学生基本信息
          </h2>
          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
            <Field label="学生姓名" value={application.name} />
            <Field label="性别" value={getGenderLabel(application.gender)} />
            <Field label="民族" value={application.ethnicity} />
            <Field label="身份证号" value={application.idCard} />
            <Field label="学籍号" value={application.studentId} />
            <Field
              label="户籍类型"
              value={getResidencyTypeLabel(application.residencyType)}
            />
          </div>
        </section>

        {/* Row 2: 申请信息（上下布局） */}
        <section className="mt-2" data-testid="print-row-2">
          <h2 className="border-b border-black pb-1 text-xs font-semibold">
            申请信息
          </h2>
          {/* 上部：字段信息 */}
          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
            <Field label="当前学校" value={application.currentSchool} />
            <Field
              label="年级变更"
              value={`${application.currentGrade} → ${application.targetGrade}`}
            />
            <Field
              label="监护人1"
              value={`${application.guardian1Name}（${application.guardian1Relation}）${phone1}`}
            />
            {application.guardian2Name && (
              <Field
                label="监护人2"
                value={`${application.guardian2Name}（${getFallbackText(application.guardian2Relation, "")}）${getFallbackText(phone2, "")}`}
              />
            )}
            <Field label="户籍地址" value={application.hukouAddress} />
            <Field label="居住地址" value={application.livingAddress} />
          </div>
          {/* 下部：转学须知 */}
          <div className="mt-2 border-t border-black/20 pt-1">
            <h3 className="font-semibold text-[10px] mb-1">转学须知</h3>
            <div className="text-[11px] leading-snug">
              {transferNoticeContent
                ? transferNoticeContent.split("\n").map((line, i) => (
                    <p key={i} className="indent-[2em]">{line}</p>
                  ))
                : <p>暂未设置转学须知</p>}
            </div>
          </div>
        </section>

        {/* Row 3: 状态信息 + 二维码（左右布局） */}
        <section className="mt-2" data-testid="print-row-3">
          <h2 className="border-b border-black pb-1 text-xs font-semibold">
            审核状态与结果查询
          </h2>
          <div className="mt-1 grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="font-semibold">{statusLabel}</div>
              {application.status === "PENDING" && (
                <div className="text-[10px] leading-snug space-y-0.5">
                  <p>您的转学申请已提交，目前正在审核中。</p>
                  <p>请关注城中区教育局官方发布的相关消息通知，并可随时扫描右侧二维码查询最新审核进度。</p>
                </div>
              )}
              {application.status === "SUPPLEMENT" && (
                <div className="text-[10px] leading-snug space-y-0.5">
                  <p>您的转学申请审核中发现缺少学籍信息卡。</p>
                  <p className="font-semibold">请尽快补传学籍信息卡，以免影响审核进度。</p>
                  <p>请关注城中区教育局官方发布的相关消息通知，并可随时扫描右侧二维码查询最新审核进度。</p>
                </div>
              )}
              {application.status === "APPROVED" && (
                <div className="text-[10px] leading-snug">
                  <p>恭喜，您的转学申请已通过审核。请扫描右侧二维码查看详细结果。</p>
                </div>
              )}
              {application.status === "REJECTED" && (
                <div className="text-[10px] leading-snug">
                  <p>您的转学申请未通过审核，请扫描右侧二维码查看具体原因。</p>
                </div>
              )}
              {application.adminRemark && application.status !== "REJECTED" && (
                <div className="text-[10px]">
                  审核备注：{application.adminRemark}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-1 border-l border-black/20 pl-3">
              <div
                className="flex h-[100px] w-[100px] items-center justify-center border border-black"
                data-testid="application-pending-qrcode"
              >
                {qrCodeDataUrl ? (
                  <>
                    {/* Print output relies on a plain data URL image instead of Next/Image optimization. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeDataUrl}
                    alt="申请查询二维码"
                    className="h-[92px] w-[92px]"
                  />
                  </>
                ) : (
                  <span className="text-[9px] text-gray-500">二维码生成失败</span>
                )}
              </div>
              <span className="text-[9px]">扫码查看进度</span>
            </div>
          </div>
        </section>

        {/* Row 4: 知情同意书 + 签字区 */}
        <section className="mt-2" data-testid="print-row-4">
          <h2 className="border-b border-black pb-1 text-xs font-semibold">
            转学知情同意书
          </h2>
          <div className="mt-1 text-[11px] leading-snug min-h-[60px]">
            {consentFormContent
              ? `我是申请转学学生${application.name}的家长，${consentFormContent}`
                  .split("\n")
                  .map((line, i) => (
                    <p key={i} className="indent-[2em]">{line}</p>
                  ))
              : <p>暂未设置转学知情同意书</p>}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="border-b border-black pb-4">监护人签字：</div>
            <div className="border-b border-black pb-4">日期：</div>
          </div>
        </section>
      </div>
    </section>
  );
}
