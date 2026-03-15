import Link from "next/link";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentDocument } from "@/services/dashboard-service";

type Props = { documents: RecentDocument[] };

/** Dashboard card showing recent documents across all templates */
export function RecentDocumentsSection({ documents }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="size-4" />
          Tài liệu gần đây
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Chưa có tài liệu nào
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Số tài liệu</TableHead>
                <TableHead>Mẫu</TableHead>
                <TableHead className="w-[120px]">Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="font-mono text-sm font-medium hover:underline"
                    >
                      {doc.docNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{doc.templateName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
