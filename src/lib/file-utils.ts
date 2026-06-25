import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source reliably via UNPKG to avoid bundler resolution issues in sandboxes
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '5.6.205'}/build/pdf.worker.min.mjs`;

export async function extractTextFromFile(file: File, onProgress?: (percent: number) => void): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt') {
    onProgress?.(100);
    return await file.text();
  }

  if (extension === 'pdf') {
    return await extractTextFromPDF(file, onProgress);
  }

  if (extension === 'docx') {
    return await extractTextFromDOCX(file, onProgress);
  }

  throw new Error(`Unsupported file type: ${extension}`);
}

async function extractTextFromPDF(file: File, onProgress?: (percent: number) => void): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(10);
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  
  onProgress?.(30);
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    text += strings.join(' ') + '\n';
    onProgress?.(30 + Math.round((i / pdf.numPages) * 60));
  }
  
  onProgress?.(100);
  return text.trim();
}

async function extractTextFromDOCX(file: File, onProgress?: (percent: number) => void): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(30);
  const result = await mammoth.extractRawText({ arrayBuffer });
  onProgress?.(100);
  return result.value.trim();
}

export function downloadTextAsFile(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
