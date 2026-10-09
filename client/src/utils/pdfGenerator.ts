import jsPDF from 'jspdf';
import { IReceiptData } from '../types/index.js';
import { formatINR } from './currency.js';

/**
 * Client-side vector selectable-text PDF Generator using jsPDF.
 * Generates official CEGS LMS Tax Invoice & Payment Receipt.
 */
export const downloadReceiptPdf = (data: IReceiptData): void => {
  const { payment, student, verificationUrl } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Outer border
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

  // Top Accent Banner
  doc.setFillColor(2, 132, 199); // brand-600 #0284c7
  doc.rect(margin, margin, pageWidth - margin * 2, 3, 'F');

  // HEADER
  let y = margin + 8;

  // Logo square
  doc.setFillColor(2, 132, 199);
  doc.roundedRect(margin + 5, y, 14, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CE', margin + 8, y + 9);

  // Institution title
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CAREER EXPERT GLOBAL SOLUTIONS', margin + 23, y + 6);

  doc.setTextColor(2, 132, 199);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('BUILD  •  GROW  •  EXCEL', margin + 23, y + 11);

  // Receipt Number & Payment ID (Right aligned)
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('RECEIPT NUMBER', pageWidth - margin - 5, y + 3, { align: 'right' });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.receiptNumber, pageWidth - margin - 5, y + 8, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Payment ID: ${payment.paymentId}`, pageWidth - margin - 5, y + 12, { align: 'right' });

  y += 18;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 5, y, pageWidth - margin - 5, y);

  // RECEIPT TITLE BANNER
  y += 4;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin + 5, y, pageWidth - (margin + 5) * 2, 8, 1, 1, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL PAYMENT RECEIPT / TAX INVOICE', margin + 9, y + 5.5);

  const formattedDate = new Date(payment.paymentDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Date of Issue: ${formattedDate}`, pageWidth - margin - 9, y + 5.5, { align: 'right' });

  // 2-COLUMN DETAILS
  y += 12;
  const col1X = margin + 5;
  const colWidth = (pageWidth - (margin + 5) * 2 - 4) / 2;
  const col2X = col1X + colWidth + 4;

  // Header 1 & 2
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text('STUDENT INFORMATION', col1X, y);
  doc.text('PROGRAM & BATCH DETAILS', col2X, y);

  y += 3;
  // Boxes
  doc.setFillColor(248, 250, 252);
  doc.rect(col1X, y, colWidth, 28, 'F');
  doc.rect(col2X, y, colWidth, 28, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(col1X, y, colWidth, 28, 'S');
  doc.rect(col2X, y, colWidth, 28, 'S');

  // Col 1 Content
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Student Name:', col1X + 3, y + 5);
  doc.text('Email Address:', col1X + 3, y + 11);
  doc.text('Phone Number:', col1X + 3, y + 17);
  doc.text('Student / Roll ID:', col1X + 3, y + 23);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(student.name || 'Candidate', col1X + 30, y + 5);
  doc.text(student.email || '', col1X + 30, y + 11);
  doc.text(student.phone || '+91 98765 43210', col1X + 30, y + 17);
  doc.text(student.rollNumber || 'CEGS-2025-0182', col1X + 30, y + 23);

  // Col 2 Content
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Program:', col2X + 3, y + 5);
  doc.text('Career Track:', col2X + 3, y + 11);
  doc.text('Cohort Batch:', col2X + 3, y + 17);
  doc.text('Payment Status:', col2X + 3, y + 23);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(student.programTitle || '6-Month Job-Ready Training Program', col2X + 28, y + 5, { maxWidth: colWidth - 32 });
  doc.text(student.trackName || 'Full Stack Development', col2X + 28, y + 11);
  doc.text(student.batchCode || 'CEGS-FGT-OCT15', col2X + 28, y + 17);

  const statusColor = payment.status === 'Paid' ? [22, 163, 74] : payment.status === 'Partially Paid' ? [217, 119, 6] : [220, 38, 38];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(payment.status.toUpperCase(), col2X + 28, y + 23);

  // LINE ITEMS TABLE
  y += 33;
  const tableX = margin + 5;
  const tableWidth = pageWidth - (margin + 5) * 2;

  // Header row
  doc.setFillColor(15, 23, 42);
  doc.rect(tableX, y, tableWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ITEM', tableX + 3, y + 4.5);
  doc.text('DESCRIPTION', tableX + 18, y + 4.5);
  doc.text('TYPE / RATE', tableX + 105, y + 4.5);
  doc.text('AMOUNT (INR)', tableX + tableWidth - 4, y + 4.5, { align: 'right' });

  // Row 1: Course Fee
  y += 7;
  doc.setFillColor(255, 255, 255);
  doc.rect(tableX, y, tableWidth, 7.5, 'F');
  doc.setDrawColor(241, 245, 249);
  doc.line(tableX, y + 7.5, tableX + tableWidth, y + 7.5);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('01', tableX + 3, y + 5);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(payment.description || 'Course / Training Program Tuition Fee', tableX + 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Base Tuition Fee', tableX + 105, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(payment.baseAmount), tableX + tableWidth - 4, y + 5, { align: 'right' });

  // Row 2: GST @ 18%
  y += 7.5;
  doc.setFillColor(248, 250, 252);
  doc.rect(tableX, y, tableWidth, 7.5, 'F');
  doc.line(tableX, y + 7.5, tableX + tableWidth, y + 7.5);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('02', tableX + 3, y + 5);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Goods & Services Tax (GST @ 18%)', tableX + 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('18% Statutory Rate', tableX + 105, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(payment.gstAmount), tableX + tableWidth - 4, y + 5, { align: 'right' });

  // FINANCIAL BREAKDOWN BOX & PAYMENT SETTLEMENT DETAILS (SIDE-BY-SIDE)
  y += 12;
  const breakWidth = 85;
  const breakX = tableX + tableWidth - breakWidth;
  const settleWidth = tableWidth - breakWidth - 5;
  const settleX = tableX;

  // Left side: Settlement Details
  doc.setFillColor(248, 250, 252);
  doc.rect(settleX, y, settleWidth, 34, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(settleX, y, settleWidth, 34, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text('PAYMENT SETTLEMENT DETAILS', settleX + 3, y + 5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Method:', settleX + 3, y + 12);
  doc.text('Transaction Ref ID:', settleX + 3, y + 18);
  doc.text('Payment Date:', settleX + 3, y + 24);
  doc.text('Settlement Status:', settleX + 3, y + 30);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.paymentMethod || 'Online', settleX + 36, y + 12);
  doc.text(payment.transactionId || 'N/A', settleX + 36, y + 18);
  doc.text(formattedDate, settleX + 36, y + 24);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(payment.status === 'Paid' ? 'PAID IN FULL' : payment.status.toUpperCase(), settleX + 36, y + 30);

  // Right side: Breakdown Summary
  doc.setFillColor(248, 250, 252);
  doc.rect(breakX, y, breakWidth, 34, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(breakX, y, breakWidth, 34, 'S');

  let sy = y + 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Course Base Fee:', breakX + 3, sy);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(payment.baseAmount), breakX + breakWidth - 3, sy, { align: 'right' });

  sy += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('GST @ 18%:', breakX + 3, sy);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(payment.gstAmount), breakX + breakWidth - 3, sy, { align: 'right' });

  sy += 4.5;
  doc.setDrawColor(203, 213, 225);
  doc.line(breakX + 3, sy, breakX + breakWidth - 3, sy);

  sy += 4.5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Total Payable Amount:', breakX + 3, sy);
  doc.setTextColor(2, 132, 199);
  doc.text(formatINR(payment.totalAmount), breakX + breakWidth - 3, sy, { align: 'right' });

  sy += 6;
  doc.setFontSize(7.5);
  doc.setTextColor(22, 163, 74);
  doc.text('Amount Received / Paid:', breakX + 3, sy);
  doc.text(formatINR(payment.amountPaid), breakX + breakWidth - 3, sy, { align: 'right' });

  sy += 5;
  const balanceColor = payment.balanceAmount > 0 ? [220, 38, 38] : [100, 116, 139];
  doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
  doc.text('Balance Due:', breakX + 3, sy);
  doc.text(formatINR(payment.balanceAmount), breakX + breakWidth - 3, sy, { align: 'right' });

  // OFFICIAL CONFIRMATION STAMP & SIGNATURE
  y += 40;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.rect(settleX, y, settleWidth, 16, 'F');
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.rect(settleX, y, settleWidth, 16, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('✓ OFFICIAL PAYMENT CONFIRMATION', settleX + 3, y + 5);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(21, 128, 61);
  doc.text('Payment has been verified and cleared by CEGS Institutional Accounts.', settleX + 3, y + 10, { maxWidth: settleWidth - 6 });

  // Signatory
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Career Expert Global Solutions', breakX + breakWidth - 3, y + 6, { align: 'right' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Finance Signatory', breakX + breakWidth - 3, y + 11, { align: 'right' });

  // FOOTER
  y += 24;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 5, y, pageWidth - margin - 5, y);

  y += 4;
  const verifyLink = verificationUrl || `http://localhost:5173/verify-receipt/${payment.receiptNumber}`;

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This is a computer-generated tax invoice and payment receipt issued by Career Expert Global Solutions. No physical signature is required.',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  y += 3.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(`Verify Authenticity Online: ${verifyLink}`, pageWidth / 2, y, { align: 'center' });

  // Save PDF
  doc.save(`CEGS-Receipt-${payment.receiptNumber}.pdf`);
};
