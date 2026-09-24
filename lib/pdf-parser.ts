// lib/pdf-parser.ts
import * as pdf from 'pdf-parse-fork';

export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdf.default(buffer);
    return data.text;
  } catch (error) {
    console.error('[PDF Parser] Error:', error);
    return Buffer.from(arrayBuffer).toString('utf8').replace(/[^\x20-\x7E\n]/g, '').slice(0, 3000);
  }
}
