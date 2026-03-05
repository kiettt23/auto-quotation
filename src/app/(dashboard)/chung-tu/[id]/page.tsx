import { notFound } from "next/navigation";
import { getDocEntry } from "../actions";
import { DocEntryFormPage } from "@/components/doc-entry/doc-entry-form-page";

export default async function EditDocEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getDocEntry(id);
  if (!entry) notFound();

  return <DocEntryFormPage template={entry.template} entry={entry} />;
}
