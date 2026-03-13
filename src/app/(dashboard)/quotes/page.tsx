import { getQuotes } from "./actions";
import { QuoteListPageClient } from "@/components/quote/quote-list-page-client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    customer?: string;
    sort?: string;
  }>;
};

export default async function QuoteListPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const result = await getQuotes({
    page,
    status: params.status,
    search: params.search,
    customerId: params.customer,
    sort: params.sort,
  });

  const rawData = result.ok
    ? result.value
    : { quotes: [], total: 0, totalPages: 1 };

  // Normalize Date → string for client component
  const quotes = rawData.quotes.map((q) => ({
    ...q,
    createdAt: q.createdAt instanceof Date ? q.createdAt.toISOString() : String(q.createdAt),
  }));
  const { total, totalPages } = rawData;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Báo giá</h1>
      <QuoteListPageClient
        quotes={quotes}
        total={total}
        page={page}
        totalPages={totalPages}
        currentStatus={params.status}
        currentSearch={params.search}
        currentSort={params.sort ?? "createdAt"}
        currentOrder={params.sort?.includes("asc") ? "asc" : "desc"}
      />
    </div>
  );
}
