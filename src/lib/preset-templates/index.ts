/**
 * Preset template registry.
 * Dev adds new presets here — the UI auto-discovers them.
 */

import type { PresetTemplate } from "./types";
import { pghDeliveryOrderPreset } from "./pgh-delivery-order-preset";
import { pxkWarehouseExportPreset } from "./pxk-warehouse-export-preset";

export type { PresetTemplate, PresetPlaceholder, PresetTableColumn } from "./types";

/** All available preset templates. Add new presets to this array. */
export const PRESET_TEMPLATES: PresetTemplate[] = [
  pghDeliveryOrderPreset,
  pxkWarehouseExportPreset,
];

export function getPresetById(id: string): PresetTemplate | undefined {
  return PRESET_TEMPLATES.find((p) => p.id === id);
}

/** Find a preset whose namePatterns match the given template name */
export function findPresetByName(name: string): PresetTemplate | undefined {
  const lower = name.toLowerCase().trim();
  return PRESET_TEMPLATES.find((p) =>
    p.namePatterns.some((pattern) => lower.includes(pattern))
  );
}
