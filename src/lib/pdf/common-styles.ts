import { StyleSheet } from "@react-pdf/renderer";
import { FONT_FAMILY } from "./font-registration";

// Shared PDF stylesheet — import and extend per document type
export const commonStyles = StyleSheet.create({
  page: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 40,
    color: "#1a1a1a",
  },
  section: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
  },
  bold: {
    fontWeight: "bold",
  },
  textCenter: {
    textAlign: "center",
  },
  textRight: {
    textAlign: "right",
  },
  heading1: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  heading2: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
  },
  label: {
    fontSize: 9,
    color: "#555",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginVertical: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontWeight: "bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
    fontSize: 9,
  },
});
