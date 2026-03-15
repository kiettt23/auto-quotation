/** Shared types for preset template definitions (client-safe — no server imports). */

export type PresetPlaceholder = {
  key: string;
  label: string;
  type: "text" | "number" | "date";
  /** Dot-path to auto-fill from tenant settings, e.g. "tenant.companyName" */
  autoFill?: string;
  /** Enable autocomplete from a catalog data source */
  dataSource?: "customer" | "product";
  /** Map source fields to other placeholder keys when autocomplete selects an item.
   *  e.g. { company: "customerCompany", phone: "customerPhone" } */
  linkedFields?: Record<string, string>;
};

export type PresetTableColumn = {
  key: string;
  label: string;
  type: "text" | "number" | "date";
  /** Enable autocomplete from a catalog data source */
  dataSource?: "customer" | "product";
  /** Map source fields to other column keys in the same row */
  linkedFields?: Record<string, string>;
};

/** Client-safe preset metadata — no renderer reference */
export type PresetTemplate = {
  id: string;
  name: string;
  /** Name patterns for matching (lowercase). Template engine uses these to route. */
  namePatterns: string[];
  description: string;
  fileType: "pdf" | "excel";
  docPrefix: string;
  placeholders: PresetPlaceholder[];
  tableColumns: PresetTableColumn[];
};
