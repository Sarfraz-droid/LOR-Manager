import jsPDF from "jspdf";

/**
 * Generate and download a PDF file from plain text content.
 * Handles multi-page documents automatically.
 */
export function downloadAsPdf(plainText: string, filename: string): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.getHeight();
  const lines = doc.splitTextToSize(plainText, maxWidth);
  let y = margin;
  for (const line of lines) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }
  doc.save(filename);
}
