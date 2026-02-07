
const nextConfig = {
 serverExternalPackages: [
  "pdfjs-dist",
  "puppeteer-core",
],
  outputFileTracingIncludes: {
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
