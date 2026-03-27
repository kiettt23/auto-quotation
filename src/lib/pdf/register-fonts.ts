import { Font } from "@react-pdf/renderer";

let registered = false;

/** Register Vietnamese-compatible fonts for PDF rendering */
export function registerPdfFonts() {
  if (registered) return;
  registered = true;

  Font.registerHyphenationCallback((word) => [word]);

  try {
    Font.register({
    family: "Roboto",
    fonts: [
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
        fontWeight: "normal",
      },
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
        fontWeight: "bold",
      },
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
        fontWeight: "normal",
        fontStyle: "italic",
      },
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf",
        fontWeight: "bold",
        fontStyle: "italic",
      },
    ],
  });
  } catch (err) {
    console.error("[PDF Fonts] Không thể đăng ký font:", err);
  }
}
