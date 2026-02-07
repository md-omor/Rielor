import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium-min",
    "pdfjs-dist",
    "pdf-parse",
  ],
  outputFileTracingIncludes: {
    "/api/extract-jd": [
      "./node_modules/puppeteer-core/**",
      "./node_modules/@sparticuz/**",
    ],
  },
};

export default nextConfig;

