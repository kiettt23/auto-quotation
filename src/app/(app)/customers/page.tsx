import { requireCompanyId } from "@/lib/auth/get-company-id";
import { listCustomers } from "@/services/customer.service";
import { CustomerPageClient } from "./customer-page-client";

export default async function CustomersPage() {
  const companyId = await requireCompanyId();
  const customers = await listCustomers(companyId);

  return <CustomerPageClient customers={customers} />;
}
