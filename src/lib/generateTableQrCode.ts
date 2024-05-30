import jsPDF from 'jspdf';
import bwipjs from 'bwip-js';

export async function generateTableQrCode(
  doc: jsPDF,
  table: number,
  link_url: string,
  document: Document
) {
  const filename = `qrcode-table-${table}`;

  const canvas = document.createElement('canvas');
  bwipjs.toCanvas(canvas, {
    bcid: 'qrcode',
    text: link_url,
    scale: 3,
  });

  doc.setFontSize(8);
  doc.setFont('Inter-Regular', 'bold');

  const heightBarCode = 30;
  doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 30, 30);

  doc.save(filename);
}
