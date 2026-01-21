const { PDFParse } = require('pdf-parse');

async function test() {
    try {
        // We need some PDF data to test. Since I don't have one handy, I'll just check if the class works.
        const parser = new PDFParse({ data: Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Count 1\n/Kids [3 0 R]\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources << >>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \n0000000178 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n272\n%%EOF') });
        console.log('Parser instance created');
        console.log('getText method exists:', typeof parser.getText);
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
