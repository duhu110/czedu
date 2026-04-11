import { SystemTextManager } from "./_components/system-text-manager";

export default function SystemTextsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">文字管理</h1>
        <p className="text-sm text-muted-foreground mt-1">
          管理各学期的系统文字内容，如转学须知、知情同意书等。
        </p>
      </div>
      <SystemTextManager />
    </div>
  );
}
