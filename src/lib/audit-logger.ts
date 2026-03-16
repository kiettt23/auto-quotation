import { db } from "@/db";
import { auditLogs } from "@/db/schema";

type AuditParams = {
  tenantId?: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
};

/** Fire-and-forget audit log entry. Never throws — failures are silently logged to console. */
export function logAudit(params: AuditParams): void {
  db.insert(auditLogs)
    .values({
      tenantId: params.tenantId ?? null,
      userId: params.userId ?? null,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId ?? null,
      metadata: params.metadata ?? null,
    })
    .then(() => {})
    .catch((e) => console.error("[audit]", e));
}
