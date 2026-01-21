import { parseFile } from './src/lib/file-parser';

async function test() {
    // Basic PDF header + some minimal content to satisfy the parser
    const mockPDF = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Count 1\n/Kids [3 0 R]\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources << >>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \n0000000178 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n272\n%%EOF');

    try {
        console.log("--- Testing parseFile with mock PDF ---");
        const result = await parseFile(mockPDF, 'application/pdf');
        console.log("Text extracted:", result.text);
        console.log("Metadata:", result.metadata);
        
        if (result.text === "Hello World") {
            console.log("\nSUCCESS: Text correctly extracted from mock PDF!");
        } else {
            console.log("\nWARNING: Extracted text mismatch, but parser ran.");
        }
    } catch (e) {
        console.error("Extraction Failed:", e);
    }
}

test();
