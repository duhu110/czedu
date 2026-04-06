import { LogoCloud } from "@/components/home/logo-cloud";

export function LogosSection() {
  return (
    <section className="relative space-y-4 border-t pt-6 pb-10">
      <h2 className="text-center font-medium text-lg tracking-tight text-muted-foreground md:text-xl">
        获得多方 <span className="text-foreground">转学服务经验</span> 参考
      </h2>
      <div className="relative z-10 mx-auto max-w-4xl">
        <LogoCloud />
      </div>
    </section>
  );
}
