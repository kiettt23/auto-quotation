import { requireUserId } from "@/lib/auth/get-user-id";
import { listCustomers } from "@/services/customer.service";
import { CustomerPageClient } from "./customer-page-client";

export default async function CustomersPage() {
  const userId = await requireUserId();
  const customers = await listCustomers(userId);

  return <CustomerPageClient customers={customers} />;
}
