import { StyleSheet } from "@react-pdf/renderer";

/** Shared PDF styles across all presets */
export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    color: "#1e293b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 2,
  },
  docTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
    textAlign: "right",
  },
  docNumber: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "right",
    marginTop: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginVertical: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  sectionText: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 2,
  },
  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    padding: 6,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    padding: 6,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    padding: 6,
    backgroundColor: "#f8fafc",
  },
  tableCell: {
    fontSize: 9,
    color: "#374151",
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
  },
  // Columns
  colStt: { width: "8%" },
  colProduct: { width: "32%", flexGrow: 1 },
  colUnit: { width: "10%" },
  colQty: { width: "10%", textAlign: "right" },
  colPrice: { width: "20%", textAlign: "right" },
  colAmount: { width: "20%", textAlign: "right" },
  // Total
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 12,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2563eb",
  },
  // Notes
  notes: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#64748b",
    marginTop: 8,
  },
  // Signatures
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
    paddingHorizontal: 40,
  },
  signatureBlock: {
    alignItems: "center",
    gap: 4,
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: "bold",
  },
  signatureHint: {
    fontSize: 8,
    color: "#94a3b8",
  },
});
