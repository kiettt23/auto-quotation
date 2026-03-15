import type { DocumentWithTemplate } from "@/services/document-service";
import type { Tenant } from "@/db/schema";

type Props = {
  document: DocumentWithTemplate;
  tenant: Tenant;
};

/** Public share view for documents — displays field data and table rows */
export function ShareDocumentView({ document: doc, tenant }: Props) {
  const brandColor = tenant.primaryColor || "#0369A1";
  const fieldData = (doc.fieldData ?? {}) as Record<string, string>;
  const tableRows = (doc.tableRows ?? []) as Record<string, string>[];
  const placeholders = (doc.template.placeholders ?? []) as { cellRef: string; label: string; type: string }[];
  const tableRegion = doc.template.tableRegion as { columns: { col: string; label: string }[] } | null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl rounded-xl border bg-white shadow-sm">
        {/* Header */}
        <div className="rounded-t-xl px-8 py-6" style={{ backgroundColor: brandColor }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{tenant.companyName || tenant.name}</h1>
              {tenant.phone && <p className="text-sm text-white/80">{tenant.phone}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white/80">{doc.template.name}</p>
              <p className="text-xl font-bold text-white">{doc.docNumber}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-8 py-6">
          {/* Field data */}
          {placeholders.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              {placeholders.map((ph) => {
                const value = fieldData[ph.cellRef];
                if (!value) return null;
                return (
                  <div key={ph.cellRef}>
                    <p className="text-gray-500">{ph.label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table data */}
          {tableRegion && tableRows.length > 0 && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left w-10">#</th>
                    {tableRegion.columns.map((col) => (
                      <th key={col.col} className="px-4 py-3 text-left">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tableRows.map((row, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      {tableRegion.columns.map((col) => (
                        <td key={col.col} className="px-4 py-3">{row[col.col] ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-4 text-center text-xs text-gray-400">
            Tài liệu được tạo bởi <span className="font-medium">Auto Quotation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
