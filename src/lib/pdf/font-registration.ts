import fs from "fs";
import path from "path";
import { Font } from "@react-pdf/renderer";

// Read font file as base64 data URL — works on local and Vercel serverless
function fontDataUrl(filename: string): string {
  const filePath = path.join(process.cwd(), "public", "fonts", filename);
  const buf = fs.readFileSync(filePath);
  return `data:font/truetype;base64,${buf.toString("base64")}`;
}

let registered = false;

/**
 * Register Roboto fonts for react-pdf.
 * Safe to call multiple times — registers only once.
 */
export function registerFonts(): void {
  if (registered) return;
  Font.register({
    family: "Roboto",
    fonts: [
      { src: fontDataUrl("Roboto-Regular.ttf"), fontWeight: "normal", fontStyle: "normal" },
      { src: fontDataUrl("Roboto-Regular.ttf"), fontWeight: "normal", fontStyle: "italic" },
      { src: fontDataUrl("Roboto-Bold.ttf"), fontWeight: "bold", fontStyle: "normal" },
      { src: fontDataUrl("Roboto-Bold.ttf"), fontWeight: "bold", fontStyle: "italic" },
    ],
  });
  registered = true;
}

export const FONT_FAMILY = "Roboto";
