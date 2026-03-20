import { requireUserId } from "@/lib/auth/get-user-id";
import { listDocuments } from "@/services/document.service";
import { DocumentListClient } from "./document-list-client";

export default async function DocumentsPage() {
  const userId = await requireUserId();
  const documents = await listDocuments(userId);

  return <DocumentListClient documents={documents} />;
}
