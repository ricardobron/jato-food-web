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

  doc.setFont('Inter-Regular', 'bold');

  doc.setFontSize(18);
  doc.text(`Mesa: ${table}`, 15, 8);

  doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 12, 30, 30);

  doc.save(filename);
}

export async function generatePinQrCode(
  doc: jsPDF,
  table: number,
  pin: string
) {
  const filename = `qrcode-table-pin-${table}`;

  doc.setFontSize(18);
  doc.setFont('Inter-Regular', 'bold');

  doc.text(`Mesa: ${table} `, 10, 15);
  doc.setFontSize(10);
  doc.text(`Pin: ${pin}`, 10, 25);

  doc.save(filename);
}
