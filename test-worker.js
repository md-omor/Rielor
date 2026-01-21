const { createRequire } = require('module');
const path = require('path');

try {
    const workerPath = require.resolve('pdfjs-dist/build/pdf.worker.mjs');
    console.log('Worker path resolved:', workerPath);
} catch (e) {
    console.log('Failed to resolve .mjs worker, trying .js');
    try {
        const workerPath = require.resolve('pdfjs-dist/build/pdf.worker.js');
        console.log('Worker path resolved:', workerPath);
    } catch (e2) {
        console.error('Failed to resolve worker:', e2.message);
    }
}
