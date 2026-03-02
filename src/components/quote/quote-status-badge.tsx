"use client";

import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
  SENT: { label: "Đã gửi", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  ACCEPTED: { label: "Chốt đơn", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  REJECTED: { label: "Từ chối", className: "bg-red-100 text-red-700 hover:bg-red-100" },
  EXPIRED: { label: "Hết hạn", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
};

export function QuoteStatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.DRAFT;
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}

export const QUOTE_STATUSES = [
  { value: "all", label: "Tất cả" },
  { value: "DRAFT", label: "Nháp" },
  { value: "SENT", label: "Đã gửi" },
  { value: "ACCEPTED", label: "Chốt đơn" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "EXPIRED", label: "Hết hạn" },
];
