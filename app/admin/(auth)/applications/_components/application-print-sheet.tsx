"use client";

import { usePrintContext } from "./print-context";
import {
  getFallbackText,
  getGenderLabel,
  getPropertyTypeLabel,
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
  pendingTextContent: string | null;
  supplementTextContent: string | null;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-1 border-b border-black/20 py-1.5">
      <span className="font-medium text-[11px]">{label}</span>
      <span className="text-[12px] whitespace-pre-line break-words">
        {value}
      </span>
    </div>
  );
}

export function ApplicationPrintSheet({
  application,
  printTimeLabel,
  qrCodeDataUrl,
  transferNoticeContent,
  consentFormContent,
  pendingTextContent,
  supplementTextContent,
}: ApplicationPrintSheetProps) {
  const { maskPhone, printMode } = usePrintContext();

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
  const pendingStatusLines = pendingTextContent?.trim()
    ? pendingTextContent.split("\n")
    : [
        "您的转学申请已提交，目前正在审核中。",
        "请关注城中区教育局官方发布的相关消息通知，并可随时扫描右侧二维码查询最新审核进度。",
      ];
  const supplementStatusLines = supplementTextContent?.trim()
    ? supplementTextContent.split("\n")
    : [
        "您的申请审核中发现缺少学籍信息卡。",
        "请尽快补传学籍信息卡，以免影响审核进度。",
      ];

  return (
    <section
      className="hidden print:block print:px-2 print:py-0"
      data-testid="print-sheet"
    >
      <div className="mx-auto flex min-h-[calc(297mm-38mm)] max-w-[794px] flex-col border border-black px-6 py-3 text-[12px] leading-relaxed text-black">
        {/* 1. 标题 */}
        <header className="border-b border-black pb-3 text-center">
          <h1 className="text-xl font-bold">
            城中区转学申请单
            {printMode === "archive" && "（留底页）"}
            {printMode === "parent" && "（家长页）"}
          </h1>
          <p className="mt-1 text-sm">{application.semester.name}</p>
        </header>

        {/* 2. 申请编号 + 打印时间 */}
        <div className="mt-2 flex justify-between text-[12px]">
          <span>打印时间：{printTimeLabel}</span>
        </div>

        {/* 3. 学生基本信息 */}
        <section className="mt-6" data-testid="print-row-1">
          <h2 className="border-b border-black pb-1 text-sm font-semibold">
            学生基本信息
          </h2>
          <div className="mt-1.5 grid grid-cols-2 gap-x-6 gap-y-0.5">
            <Field label="学生姓名" value={application.name} />
            <Field label="性别" value={getGenderLabel(application.gender)} />
            <Field label="民族" value={application.ethnicity} />
            <Field label="身份证号" value={application.idCard} />
            <Field label="学籍号" value={application.studentId} />
            <Field
              label="户籍类型"
              value={getResidencyTypeLabel(application.residencyType)}
            />
            <Field
              label="房产情况"
              value={getPropertyTypeLabel(application.propertyType)}
            />
          </div>
        </section>

        {/* 4. 申请信息（左） + 审核状态与二维码（右）并排 */}
        <section className="mt-6" data-testid="print-row-2">
          <div className="grid grid-cols-2 gap-4">
            {/* 左列：申请信息（单列） */}
            <div>
              <h2 className="border-b border-black pb-1 text-sm font-semibold">
                申请信息
              </h2>
              <div className="mt-1.5 space-y-0">
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
            </div>
            {/* 右列：审核状态 + 二维码（单列） */}
            <div
              className="border-l border-black/20 pl-4"
              data-testid="print-row-3"
            >
              <h2 className="border-b border-black pb-1 text-sm font-semibold">
                审核状态
              </h2>
              <div className="mt-1.5 space-y-1.5">
                <div className="text-[12px]">{statusLabel}</div>
                {application.status === "PENDING" && (
                  <div className="text-[11px] leading-snug space-y-0.5">
                    {pendingStatusLines.map((line, i) => (
                      <p key={i}  className="indent-[2em]">{line}</p>
                    ))}
                  </div>
                )}
                {application.status === "SUPPLEMENT" && (
                  <div className="text-[12px] leading-snug space-y-0.5">
                    {supplementStatusLines.map((line, i) => (
                      <p
                        key={i}
                        className={
                          i === supplementStatusLines.length - 1
                            ? "font-semibold"
                            : undefined
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}
                {application.status === "APPROVED" && (
                  <div className="text-[12px] leading-snug">
                    <p>恭喜，您的转学申请已通过审核。</p>
                  </div>
                )}
                {application.status === "REJECTED" && (
                  <div className="text-[12px] leading-snug">
                    <p>您的转学申请未通过审核。</p>
                  </div>
                )}
                {application.adminRemark &&
                  application.status !== "REJECTED" && (
                    <div className="text-[12px]">
                      备注：{application.adminRemark}
                    </div>
                  )}
              </div>
              {/* 二维码 */}
              <div className="mt-3 flex flex-col items-center gap-1">
                <div
                  className="flex h-[100px] w-[100px] items-center justify-center border border-black"
                  data-testid="application-pending-qrcode"
                >
                  {qrCodeDataUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCodeDataUrl}
                        alt="申请查询二维码"
                        className="h-[92px] w-[92px]"
                      />
                    </>
                  ) : (
                    <span className="text-[9px] text-gray-500">
                      二维码生成失败
                    </span>
                  )}
                </div>
                <span className="text-[9px]">扫码查看分配结果</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 转学须知 */}
        <section className="mt-6" data-testid="print-row-notice">
          <h2 className="border-b border-black pb-1 text-sm font-semibold">
            转学须知
          </h2>
          <div className="mt-1.5 text-[18px] leading-snug">
            <p>尊敬的家长：</p>
            {transferNoticeContent ? (
              transferNoticeContent.split("\n").map((line, i) => (
                <p key={i} className="indent-[2em]">
                  {line}
                </p>
              ))
            ) : (
              <p>暂未设置转学须知</p>
            )}
          </div>
        </section>

        {/* 6. 转学知情同意书 */}
        <section className="mt-6" data-testid="print-row-4">
          <h2 className="border-b border-black pb-1 text-sm font-semibold">
            转学知情同意书
          </h2>
          <div className="mt-1.5 text-[18px] leading-normal">
            {consentFormContent ? (
              `我是申请转学学生${application.name}的家长，${consentFormContent}`
                .split("\n")
                .map((line, i) => (
                  <p key={i} className="indent-[2em]">
                    {line}
                  </p>
                ))
            ) : (
              <p>暂未设置转学知情同意书</p>
            )}
          </div>
        </section>
        {/* 7. 签字区 — 始终贴底 */}
        <div className="mt-auto grid grid-cols-2 gap-x-6 pt-4">
          <div className="flex items-end">
            <span className="shrink-0 text-[13px]">监护人签字：</span>
            <span className="flex-1 border-b border-black" />
          </div>
          <div className="flex items-end">
            <span className="shrink-0 text-[13px]">日期：</span>
            <span className="flex-1 border-b border-black" />
          </div>
        </div>
      </div>
    </section>
  );
}
