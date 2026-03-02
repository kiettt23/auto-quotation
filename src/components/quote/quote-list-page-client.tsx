"use client";

import { QuoteListToolbar } from "./quote-list-toolbar";
import { QuoteDataTable } from "./quote-data-table";

export type QuoteListItem = {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerCompany: string;
  total: string;
  status: string;
  createdAt: string;
  shareToken: string | null;
};

type Props = {
  quotes: QuoteListItem[];
  total: number;
  page: number;
  totalPages: number;
  currentStatus?: string;
  currentSearch?: string;
  currentSort: string;
  currentOrder: string;
};

export function QuoteListPageClient({
  quotes,
  total,
  page,
  totalPages,
  currentStatus,
  currentSearch,
  currentSort,
  currentOrder,
}: Props) {
  return (
    <div className="space-y-4">
      <QuoteListToolbar
        currentStatus={currentStatus}
        currentSearch={currentSearch}
      />
      <QuoteDataTable
        quotes={quotes}
        total={total}
        page={page}
        totalPages={totalPages}
        currentSort={currentSort}
        currentOrder={currentOrder}
      />
    </div>
  );
}
