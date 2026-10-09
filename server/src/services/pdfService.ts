import PDFDocument from 'pdfkit';
import { IPayment } from '../models/Payment.js';
import { formatIndianCurrency } from './paymentService.js';
import { Response } from 'express';

export interface IReceiptPopulatedData {
  payment: IPayment;
  student: {
    name: string;
    email: string;
    phone?: string;
    rollNumber?: string;
    batchCode?: string;
    trackName?: string;
    programTitle?: string;
  };
  verificationUrl?: string;
}

/**
 * Generate a professional vector PDF receipt with selectable text
 * conforming to official CEGS LMS institutional standards.
 */
export const generateReceiptPDF = (
  data: IReceiptPopulatedData,
  res: Response
): void => {
  const { payment, student, verificationUrl } = data;

  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: `Payment Receipt - ${payment.receiptNumber}`,
      Author: 'Career Expert Global Solutions LMS',
      Subject: 'Official Payment Receipt & Tax Invoice',
      Keywords: 'CEGS, LMS, Payment, Receipt, GST',
    },
  });

  // Pipe to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Receipt-${payment.receiptNumber}.pdf"`
  );

  doc.pipe(res);

  // Background Watermark / Accent Border
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
    .lineWidth(1)
    .strokeColor('#e2e8f0')
    .stroke();

  // Top Accent Banner
  doc.rect(30, 30, doc.page.width - 60, 6)
    .fillColor('#0284c7') // brand-600
    .fill();

  // HEADER SECTION
  let y = 50;

  // CEGS Logo Box
  doc.roundedRect(45, y, 42, 42, 8)
    .fillColor('#0284c7')
    .fill();

  doc.fillColor('#ffffff')
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('CE', 52, y + 12);

  // Header Title
  doc.fillColor('#0f172a')
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('CAREER EXPERT GLOBAL SOLUTIONS', 98, y + 4);

  doc.fillColor('#0284c7')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('BUILD  •  GROW  •  EXCEL', 98, y + 23);

  // Receipt Number & Date Box on the right
  doc.fillColor('#64748b')
    .fontSize(8)
    .font('Helvetica')
    .text('RECEIPT NUMBER', 380, y, { align: 'right' });

  doc.fillColor('#0f172a')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(payment.receiptNumber, 380, y + 12, { align: 'right' });

  doc.fillColor('#64748b')
    .fontSize(8)
    .font('Helvetica')
    .text(`Payment ID: ${payment.paymentId}`, 380, y + 26, { align: 'right' });

  y += 55;
  doc.moveTo(45, y).lineTo(doc.page.width - 45, y).strokeColor('#e2e8f0').stroke();

  // RECEIPT TITLE BAR
  y += 15;
  doc.roundedRect(45, y, doc.page.width - 90, 26, 4)
    .fillColor('#f8fafc')
    .fill();

  doc.fillColor('#0f172a')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('OFFICIAL PAYMENT RECEIPT / TAX INVOICE', 55, y + 8);

  const formattedDate = new Date(payment.paymentDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  doc.fillColor('#475569')
    .fontSize(9)
    .font('Helvetica')
    .text(`Date of Issue: ${formattedDate}`, 380, y + 8, { align: 'right' });

  // STUDENT & PROGRAM DETAILS SECTION (2 COLUMNS)
  y += 40;
  const col1X = 45;
  const col2X = 310;

  doc.fillColor('#0284c7')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('STUDENT INFORMATION', col1X, y);

  doc.fillColor('#0284c7')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('PROGRAM & BATCH DETAILS', col2X, y);

  y += 16;
  doc.rect(col1X, y, 245, 80).fillColor('#f8fafc').fill();
  doc.rect(col2X, y, doc.page.width - 45 - col2X, 80).fillColor('#f8fafc').fill();

  // Col 1 fields
  doc.fillColor('#64748b').fontSize(8).font('Helvetica');
  doc.text('Student Name:', col1X + 10, y + 8);
  doc.text('Email Address:', col1X + 10, y + 24);
  doc.text('Phone Number:', col1X + 10, y + 40);
  doc.text('Student / Roll ID:', col1X + 10, y + 56);

  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
  doc.text(student.name || 'Saif Khan', col1X + 90, y + 8);
  doc.text(student.email || 'student@careerexpertglobal.com', col1X + 90, y + 24);
  doc.text(student.phone || '+91 98765 43210', col1X + 90, y + 40);
  doc.text(student.rollNumber || 'CEGS-2025-0182', col1X + 90, y + 56);

  // Col 2 fields
  doc.fillColor('#64748b').fontSize(8).font('Helvetica');
  doc.text('Program:', col2X + 10, y + 8);
  doc.text('Career Track:', col2X + 10, y + 24);
  doc.text('Cohort Batch:', col2X + 10, y + 40);
  doc.text('Payment Status:', col2X + 10, y + 56);

  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
  doc.text(student.programTitle || '6-Month Job-Ready Training Program', col2X + 85, y + 8, { width: 170 });
  doc.text(student.trackName || 'Full Stack Development', col2X + 85, y + 24);
  doc.text(student.batchCode || 'CEGS-FGT-OCT15', col2X + 85, y + 40);

  // Status with color
  const statusColor = payment.status === 'Paid' ? '#16a34a' : payment.status === 'Partially Paid' ? '#d97706' : '#dc2626';
  doc.fillColor(statusColor).fontSize(8).font('Helvetica-Bold');
  doc.text(payment.status.toUpperCase(), col2X + 85, y + 56);

  // LINE ITEM TABLE
  y += 95;

  // Table Header
  doc.rect(45, y, doc.page.width - 90, 22).fillColor('#0f172a').fill();
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
  doc.text('ITEM NO.', 55, y + 7);
  doc.text('DESCRIPTION', 110, y + 7);
  doc.text('RATE / TYPE', 340, y + 7);
  doc.text('AMOUNT (INR)', 430, y + 7, { align: 'right' });

  // Table Row 1: Course Fee
  y += 22;
  doc.rect(45, y, doc.page.width - 90, 24).fillColor('#ffffff').fill();
  doc.moveTo(45, y + 24).lineTo(doc.page.width - 45, y + 24).strokeColor('#e2e8f0').stroke();

  doc.fillColor('#475569').fontSize(8).font('Helvetica').text('01', 55, y + 8);
  doc.fillColor('#0f172a').font('Helvetica-Bold').text(payment.description || 'Course / Training Program Fee', 110, y + 8);
  doc.fillColor('#64748b').font('Helvetica').text('Base Tuition Fee', 340, y + 8);
  doc.fillColor('#0f172a').font('Helvetica-Bold').text(formatIndianCurrency(payment.baseAmount), 430, y + 8, { align: 'right' });

  // Table Row 2: GST @ 18%
  y += 24;
  doc.rect(45, y, doc.page.width - 90, 24).fillColor('#f8fafc').fill();
  doc.moveTo(45, y + 24).lineTo(doc.page.width - 45, y + 24).strokeColor('#e2e8f0').stroke();

  doc.fillColor('#475569').fontSize(8).font('Helvetica').text('02', 55, y + 8);
  doc.fillColor('#0f172a').font('Helvetica-Bold').text('Goods & Services Tax (GST @ 18%)', 110, y + 8);
  doc.fillColor('#64748b').font('Helvetica').text('Tax (18% Statutory)', 340, y + 8);
  doc.fillColor('#0f172a').font('Helvetica-Bold').text(formatIndianCurrency(payment.gstAmount), 430, y + 8, { align: 'right' });

  // Summary Breakdown Box
  y += 35;
  const sumBoxX = 290;
  const sumBoxWidth = doc.page.width - 45 - sumBoxX;

  doc.rect(sumBoxX, y, sumBoxWidth, 90).fillColor('#f8fafc').fill();
  doc.rect(sumBoxX, y, sumBoxWidth, 90).strokeColor('#e2e8f0').stroke();

  let sy = y + 8;
  doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('Course Base Fee:', sumBoxX + 12, sy);
  doc.fillColor('#0f172a').font('Helvetica-Bold').text(formatIndianCurrency(payment.baseAmount), sumBoxX + 120, sy, { align: 'right' });

  sy += 16;
  doc.fillColor('#64748b').font('Helvetica').text('GST @ 18%:', sumBoxX + 12, sy);
  doc.fillColor('#0f172a').font('Helvetica-Bold').text(formatIndianCurrency(payment.gstAmount), sumBoxX + 120, sy, { align: 'right' });

  sy += 16;
  doc.moveTo(sumBoxX + 10, sy).lineTo(sumBoxX + sumBoxWidth - 10, sy).strokeColor('#cbd5e1').stroke();
  sy += 6;
  doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text('Total Payable Amount:', sumBoxX + 12, sy);
  doc.fillColor('#0284c7').fontSize(9).font('Helvetica-Bold').text(formatIndianCurrency(payment.totalAmount), sumBoxX + 120, sy, { align: 'right' });

  sy += 16;
  doc.fillColor('#16a34a').fontSize(8).font('Helvetica-Bold').text('Amount Received / Paid:', sumBoxX + 12, sy);
  doc.fillColor('#16a34a').fontSize(8).font('Helvetica-Bold').text(formatIndianCurrency(payment.amountPaid), sumBoxX + 120, sy, { align: 'right' });

  sy += 14;
  doc.fillColor(payment.balanceAmount > 0 ? '#dc2626' : '#64748b').fontSize(8).font('Helvetica-Bold').text('Balance Due:', sumBoxX + 12, sy);
  doc.fillColor(payment.balanceAmount > 0 ? '#dc2626' : '#64748b').fontSize(8).font('Helvetica-Bold').text(formatIndianCurrency(payment.balanceAmount), sumBoxX + 120, sy, { align: 'right' });

  // PAYMENT METHOD & TRANSACTION DETAILS (LEFT SIDE)
  doc.roundedRect(45, y, 230, 90, 4).fillColor('#f8fafc').fill();
  doc.roundedRect(45, y, 230, 90, 4).strokeColor('#e2e8f0').stroke();

  doc.fillColor('#0284c7').fontSize(8).font('Helvetica-Bold').text('PAYMENT SETTLEMENT DETAILS', 55, y + 8);
  doc.fillColor('#64748b').fontSize(8).font('Helvetica');
  doc.text('Payment Mode:', 55, y + 26);
  doc.text('Transaction Ref ID:', 55, y + 42);
  doc.text('Payment Date:', 55, y + 58);
  doc.text('Receipt Status:', 55, y + 74);

  doc.fillColor('#0f172a').font('Helvetica-Bold');
  doc.text(payment.paymentMethod || 'Online', 145, y + 26);
  doc.text(payment.transactionId || 'N/A', 145, y + 42);
  doc.text(formattedDate, 145, y + 58);
  doc.fillColor(statusColor).text(payment.status === 'Paid' ? 'PAID IN FULL' : payment.status.toUpperCase(), 145, y + 74);

  // OFFICIAL SEAL / AUTHORIZED SIGNATORY
  y += 105;

  doc.rect(45, y, 230, 45).fillColor('#f0fdf4').fill();
  doc.rect(45, y, 230, 45).strokeColor('#bbf7d0').stroke();

  doc.fillColor('#16a34a').fontSize(9).font('Helvetica-Bold').text('✓ OFFICIAL PAYMENT CONFIRMATION', 55, y + 10);
  doc.fillColor('#15803d').fontSize(7.5).font('Helvetica').text(
    'Payment has been verified and accounted by CEGS Finance Department.',
    55,
    y + 24,
    { width: 215 }
  );

  // Authorized Signatory
  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text('Career Expert Global Solutions', 360, y + 15, { align: 'right' });
  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('Authorized Financial Officer', 360, y + 28, { align: 'right' });

  // FOOTER & VERIFICATION LINK
  y += 55;
  doc.moveTo(45, y).lineTo(doc.page.width - 45, y).strokeColor('#e2e8f0').stroke();

  y += 10;
  const verifyLink = verificationUrl || `http://localhost:5173/verify-receipt/${payment.receiptNumber}`;

  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text(
    'This is a computer-generated tax invoice and payment receipt issued by Career Expert Global Solutions. No physical signature is required.',
    45,
    y,
    { align: 'center', width: doc.page.width - 90 }
  );

  doc.fillColor('#0284c7').fontSize(7.5).font('Helvetica-Bold').text(
    `Verify Authenticity Online: ${verifyLink}`,
    45,
    y + 12,
    { align: 'center', width: doc.page.width - 90 }
  );

  doc.end();
};
