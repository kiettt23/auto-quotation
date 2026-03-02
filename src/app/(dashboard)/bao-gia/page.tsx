import { getQuotes } from "./actions";
import { QuoteListPageClient } from "@/components/quote/quote-list-page-client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    customer?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    order?: string;
  }>;
};

export default async function QuoteListPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const { quotes, total, totalPages } = await getQuotes({
    page,
    status: params.status,
    search: params.search,
    customerId: params.customer,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    sortBy: params.sort,
    sortOrder: (params.order as "asc" | "desc") || "desc",
  });

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
        currentOrder={params.order ?? "desc"}
      />
    </div>
  );
}
