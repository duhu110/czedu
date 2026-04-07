import {
  getFallbackText,
  getGenderLabel,
  getResidencyTypeLabel,
  type PrintableApplication,
} from "./application-print-utils";

type ApplicationPrintSheetProps = {
  application: PrintableApplication;
  printTimeLabel: string;
  pendingLookupUrl: string;
  qrCodeDataUrl?: string | null;
};

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2 border-b border-black/20 py-1.5">
      <span className="font-medium">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function ApplicationPrintSheet({
  application,
  printTimeLabel,
  pendingLookupUrl,
  qrCodeDataUrl,
}: ApplicationPrintSheetProps) {
  return (
    <section className="hidden print:block print:px-4 print:py-3">
      <div className="mx-auto max-w-[794px] border border-black px-5 py-4 text-xs leading-relaxed text-black">
        <header className="border-b border-black pb-3 text-center">
          <h1 className="text-xl font-bold">转学申请单</h1>
          <p className="mt-1">{application.semester.name}</p>
          <div className="mt-2 flex justify-between text-left text-[11px]">
            <span>申请编号：{application.id}</span>
            <span>打印时间：{printTimeLabel}</span>
          </div>
        </header>

        <div className="mt-4 space-y-4">
          <section>
            <h2 className="border-b border-black pb-1.5 text-sm font-semibold">
              基本信息
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1">
              <Field label="学生姓名" value={application.name} />
              <Field label="性别" value={getGenderLabel(application.gender)} />
              <Field label="身份证号" value={application.idCard} />
              <Field label="学籍号" value={application.studentId} />
              <Field
                label="户籍类型"
                value={getResidencyTypeLabel(application.residencyType)}
              />
            </div>
          </section>

          <section>
            <h2 className="border-b border-black pb-1.5 text-sm font-semibold">
              监护人信息
            </h2>
            <div
              className="mt-2 grid grid-cols-2 gap-3"
              data-testid="guardian-grid"
            >
              <div className="space-y-1 rounded border border-black/20 px-3 py-2">
                <div className="font-semibold">监护人1</div>
                <div>姓名：{application.guardian1Name}</div>
                <div>电话：{application.guardian1Phone}</div>
              </div>
              <div className="space-y-1 rounded border border-black/20 px-3 py-2">
                <div className="font-semibold">监护人2</div>
                <div>姓名：{getFallbackText(application.guardian2Name, "无")}</div>
                <div>电话：{getFallbackText(application.guardian2Phone, "无")}</div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="border-b border-black pb-1.5 text-sm font-semibold">
              学校与地址
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1">
              <Field label="当前学校" value={application.currentSchool} />
              <Field label="当前年级" value={application.currentGrade} />
              <Field label="目标年级" value={application.targetGrade} />
              <Field
                label="分配学校"
                value={getFallbackText(application.targetSchool, "尚未分配")}
              />
              <Field label="户籍地址" value={application.hukouAddress} />
              <Field label="居住地址" value={application.livingAddress} />
            </div>
          </section>

          <section>
            <h2 className="border-b border-black pb-1.5 text-sm font-semibold">
              查询结果二维码
            </h2>
            <div
              className="mt-2 grid grid-cols-[140px_1fr] gap-4"
              data-testid="print-footer-grid"
            >
              <div
                className="flex h-[116px] w-[116px] items-center justify-center border border-black"
                data-testid="application-pending-qrcode"
              >
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="申请查询二维码"
                    className="h-[108px] w-[108px]"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">二维码生成失败</span>
                )}
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p>扫码查看申请处理进度</p>
                  <p className="break-all">{pendingLookupUrl}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="border-b border-black pb-4">监护人签字</div>
                  <div className="border-b border-black pb-4">审核人签字</div>
                  <div className="border-b border-black pb-4">备注</div>
                  <div className="border-b border-black pb-4">日期</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
