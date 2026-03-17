import { Font } from "@react-pdf/renderer";

let registered = false;

/** Register Vietnamese-compatible fonts for PDF rendering */
export function registerPdfFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmbiA8.ttf",
        fontWeight: "normal",
      },
      {
        src: "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjalmbiA8.ttf",
        fontWeight: "bold",
      },
    ],
  });
}
