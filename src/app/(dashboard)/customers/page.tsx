import { getCustomers } from "./actions";
import { CustomerPageClient } from "@/components/customer/customer-page-client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
};

export default async function CustomersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const search = params.search;

  const result = await getCustomers({ page, search });

  // On error render empty state — client shows toast on mutations
  const data = result.ok
    ? result.value
    : { customers: [], total: 0, page: 1, totalPages: 1 };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Khách hàng</h1>
      <CustomerPageClient
        customers={data.customers}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
        currentSearch={search}
      />
    </div>
  );
}
