import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@sparticuz/chromium-min",
    "puppeteer-core", 
    "pdfjs-dist", 
    "pdf-parse"
  ],
  outputFileTracingIncludes: {
    "/api/upload": ["./node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"],
    "/api/analyze-files": ["./node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"],
  },
};

export default nextConfig;
