import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-core", 
    "pdfjs-dist", 
    "pdf-parse"
  ],
  outputFileTracingIncludes: {
    "/api/upload": ["./node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"],
    "/api/analyze-files": ["./node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"],
    "/api/extract-jd": [
        "./node_modules/puppeteer-core/**",
      ],
  },
};

export default nextConfig;
