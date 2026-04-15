import { FullWidthDivider } from "@/components/ui/full-width-divider";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFoundPage() {
  return (
    <div className="flex w-full items-center justify-center overflow-hidden">
      <div className="flex h-screen items-center border-x">
        <div>
          <FullWidthDivider />
          <Empty>
            <EmptyHeader>
              <EmptyTitle className="font-black font-mono text-8xl">
                404
              </EmptyTitle>
              <EmptyDescription className="text-nowrap">
                你访问的页面不存在
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
          <FullWidthDivider />
        </div>
      </div>
    </div>
  );
}
