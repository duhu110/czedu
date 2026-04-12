import { getSchools } from "@/app/actions/school";
import { SchoolManager } from "./_components/school-manager";

export default async function AdminSchoolsPage() {
  const result = await getSchools();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">学校管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          维护目标学校基础信息，包括分区依据、学校地址和学校须知。
        </p>
      </div>
      <SchoolManager schools={result.data ?? []} />
    </div>
  );
}
