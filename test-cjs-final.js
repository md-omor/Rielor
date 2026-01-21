import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

try {
  const pdfPath = resolve(__dirname, 'node_modules/pdf-parse/dist/pdf-parse/cjs/index.cjs');
  console.log('Loading CJS PDF parser from:', pdfPath);
  const pdfModule = require(pdfPath);
  
  // In CJS bundle of 2.4.5, it usually exports an object with PDFParse
  const PDFParse = pdfModule.PDFParse || pdfModule;
  
  console.log('PDFParse type:', typeof PDFParse);
  if (typeof PDFParse === 'function') {
    // If it's a class or function
    console.log('Success: PDFParse is a function/class');
  } else {
    console.log('Keys:', Object.keys(pdfModule));
  }
} catch (e) {
  console.error('Test failed:', e.message);
}
