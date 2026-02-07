const nextConfig = {
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium-min",
    // if you ever use full package:
    // "@sparticuz/chromium",
    "pdfjs-dist",
    "pdf-parse",
  ],

  outputFileTracingIncludes: {
    "/api/extract-jd": [
      "./node_modules/puppeteer-core/**",
      "./node_modules/@sparticuz/chromium-min/**",
    ],

    "/api/upload": [
      "./node_modules/pdf-parse/**",
      "./node_modules/pdfjs-dist/**",
    ],
    "/api/analyze-files": [
      "./node_modules/pdf-parse/**",
      "./node_modules/pdfjs-dist/**",
    ],
  },
};

export default nextConfig;
