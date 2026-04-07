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
};

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[112px_1fr] gap-3 border-b border-black/20 py-2">
      <span className="font-medium">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function ApplicationPrintSheet({
  application,
  printTimeLabel,
  pendingLookupUrl,
}: ApplicationPrintSheetProps) {
  return (
    <section className="hidden print:block print:px-6 print:py-5">
      <div className="mx-auto max-w-[794px] border border-black px-6 py-5 text-sm text-black">
        <header className="border-b border-black pb-4 text-center">
          <h1 className="text-2xl font-bold">转学申请单</h1>
          <p className="mt-2">{application.semester.name}</p>
          <div className="mt-3 flex justify-between text-left text-xs">
            <span>申请编号：{application.id}</span>
            <span>打印时间：{printTimeLabel}</span>
          </div>
        </header>

        <div className="mt-5 space-y-5">
          <section>
            <h2 className="border-b border-black pb-2 text-base font-semibold">
              基本信息
            </h2>
            <div className="mt-2">
              <Field label="学生姓名" value={application.name} />
              <Field label="性别" value={getGenderLabel(application.gender)} />
              <Field label="身份证号" value={application.idCard} />
              <Field label="学籍号" value={application.studentId} />
              <Field
                label="户籍类型"
                value={getResidencyTypeLabel(application.residencyType)}
              />
              <Field label="申请学期" value={application.semester.name} />
            </div>
          </section>

          <section>
            <h2 className="border-b border-black pb-2 text-base font-semibold">
              监护人信息
            </h2>
            <div className="mt-2">
              <Field label="监护人1姓名" value={application.guardian1Name} />
              <Field label="监护人1电话" value={application.guardian1Phone} />
              <Field
                label="监护人2姓名"
                value={getFallbackText(application.guardian2Name, "无")}
              />
              <Field
                label="监护人2电话"
                value={getFallbackText(application.guardian2Phone, "无")}
              />
            </div>
          </section>

          <section>
            <h2 className="border-b border-black pb-2 text-base font-semibold">
              学校与地址
            </h2>
            <div className="mt-2">
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
            <h2 className="border-b border-black pb-2 text-base font-semibold">
              查询结果二维码
            </h2>
            <div className="mt-2 space-y-2">
              <p>扫码查看申请处理进度</p>
              <p>{pendingLookupUrl}</p>
            </div>
          </section>

          <section>
            <h2 className="border-b border-black pb-2 text-base font-semibold">
              签字栏
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-6">
              <div className="border-b border-black pb-8">监护人签字</div>
              <div className="border-b border-black pb-8">审核人签字</div>
              <div className="border-b border-black pb-8">备注</div>
              <div className="border-b border-black pb-8">日期</div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
