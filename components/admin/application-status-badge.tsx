import { Badge } from "@/components/ui/badge";
import {
  applicationStatusMeta,
  type ApplicationStatus,
} from "@/lib/admin/application-status";
import { cn } from "@/lib/utils";

export function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const meta = applicationStatusMeta[status];

  return (
    <Badge className={cn("font-medium", meta.className)} variant="outline">
      {meta.label}
    </Badge>
  );
}
