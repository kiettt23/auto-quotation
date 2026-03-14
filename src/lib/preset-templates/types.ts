/** Shared types for preset template definitions (client-safe — no server imports). */

export type PresetPlaceholder = {
  key: string;
  label: string;
  type: "text" | "number" | "date";
  /** Dot-path to auto-fill from tenant settings, e.g. "tenant.companyName" */
  autoFill?: string;
};

export type PresetTableColumn = {
  key: string;
  label: string;
  type: "text" | "number" | "date";
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
