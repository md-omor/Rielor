const { createRequire } = require('module');
const requireCJS = createRequire(__filename);
const path = require('path');
const fs = require('fs');

try {
    const pdfPath = path.resolve(__dirname, 'node_modules/pdf-parse/dist/pdf-parse/cjs/index.cjs');
    console.log('Loading PDF parser from:', pdfPath);
    const pdf = require(pdfPath);
    console.log('PDF keys:', Object.keys(pdf));
    
    // Test if it works like a function (original pdf-parse API)
    if (typeof pdf === 'function') {
        console.log('pdf is a function');
    } else if (pdf.PDFParse) {
        console.log('pdf.PDFParse is present (Class API)');
    } else if (pdf.default && typeof pdf.default === 'function') {
        console.log('pdf.default is a function');
    } else {
        console.log('pdf exports:', typeof pdf);
    }
} catch (e) {
    console.error('Error loading PDF parser:', e);
}
