import { notFound } from "next/navigation";

import { ApplicationDetail } from "@/components/admin/application-detail";
import { getTransferApplicationById } from "@/lib/admin/mock-transfer-applications";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = getTransferApplicationById(id);

  if (!application) {
    notFound();
  }

  return <ApplicationDetail application={application} />;
}
