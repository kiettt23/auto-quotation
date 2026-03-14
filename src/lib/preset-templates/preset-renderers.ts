/**
 * Server-only: maps preset IDs to their renderer functions.
 * Keep this separate from the client-safe preset metadata to avoid
 * pulling Node.js modules (fs, path) into the client bundle.
 */

import type { Tenant } from "@/db/schema";
import type { RenderResult } from "@/lib/template-engine/types";
import { renderPghPdf } from "@/lib/template-engine/render-pgh-pdf";
import { renderPxkPdf } from "@/lib/template-engine/render-pxk-pdf";
import { findPresetByName } from "./index";

export type PresetRenderer = (
  fieldData: Record<string, string>,
  tableRows: Record<string, string>[],
  tenant: Tenant,
  docNumber: string
) => Promise<RenderResult>;

/** Map preset ID → renderer. Add new entries when creating presets. */
const RENDERER_MAP: Record<string, PresetRenderer> = {
  "preset-pgh": renderPghPdf,
  "preset-pxk": renderPxkPdf,
};

/**
 * Find a preset renderer by template name.
 * Returns undefined if no preset matches.
 */
export function findPresetRenderer(templateName: string): PresetRenderer | undefined {
  const preset = findPresetByName(templateName);
  if (!preset) return undefined;
  return RENDERER_MAP[preset.id];
}
