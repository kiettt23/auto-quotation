import type { DocumentData } from "@/lib/types/document-data";
import type { ColumnDef } from "@/lib/types/column-def";

/** Props shared by all PDF templates */
export interface PdfTemplateProps {
  title: string;
  documentNumber: string;
  date: string;
  company: {
    name: string;
    address?: string | null;
    phone?: string | null;
    taxCode?: string | null;
    logoUrl?: string | null;
    headerLayout?: string | null;
    driverName?: string | null;
    vehicleId?: string | null;
  };
  data: DocumentData;
  columns: ColumnDef[];
  showTotal: boolean;
  signatureLabels: string[];
}

/** Format VND currency */
export function fmtCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}
