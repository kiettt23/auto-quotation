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

  const { customers, total, totalPages } = await getCustomers({
    page,
    search,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Khách hàng</h1>
      <CustomerPageClient
        customers={customers}
        total={total}
        page={page}
        totalPages={totalPages}
        currentSearch={search}
      />
    </div>
  );
}
