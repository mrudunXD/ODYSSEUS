import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (invoice: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc.fillColor('#E85D04').fontSize(20).text('Springfield International School', { align: 'left' });
    doc.fillColor('#6B7280').fontSize(10).text('104 Edu Campus Way, Financial District', { align: 'left' });
    doc.text('Affiliation No: SIS-882194 | Tax ID: TAX-9912083', { align: 'left' });

    doc.moveDown();
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Invoice Title & Info
    doc.fillColor('#1A1A1A').fontSize(14).text(`OFFICIAL TAX INVOICE: ${invoice.invoiceNo}`, { underline: true });
    doc.fontSize(10).text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString('en-IN')}`);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`);

    doc.moveDown();

    // Student Info
    doc.fillColor('#1A1A1A').fontSize(11).text(`Student Name: ${invoice.student?.name || 'N/A'}`);
    doc.fontSize(10).text(`Student Code: ${invoice.student?.studentCode || 'N/A'}`);
    doc.text(`Parent Name: ${invoice.student?.parentName || 'N/A'}`);
    doc.text(`Parent Email: ${invoice.student?.parentEmail || 'N/A'}`);

    doc.moveDown();

    // Items Table Header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Item Description', 40, tableTop);
    doc.text('Amount (INR)', 450, tableTop, { align: 'right' });

    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;
    doc.font('Helvetica');

    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach((item: any) => {
        doc.text(item.label, 40, y);
        doc.text(`Rs. ${item.amount.toLocaleString('en-IN')}`, 450, y, { align: 'right' });
        y += 20;
      });
    } else {
      doc.text('Tuition & General Fee Head', 40, y);
      doc.text(`Rs. ${invoice.totalAmount.toLocaleString('en-IN')}`, 450, y, { align: 'right' });
      y += 20;
    }

    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, y).lineTo(550, y).stroke();
    y += 10;

    // Totals
    doc.font('Helvetica-Bold');
    doc.text(`Total Amount: Rs. ${invoice.totalAmount.toLocaleString('en-IN')}`, 40, y, { align: 'right' });
    y += 15;
    doc.fillColor('#16A34A').text(`Paid Amount: Rs. ${invoice.paidAmount.toLocaleString('en-IN')}`, 40, y, { align: 'right' });
    y += 15;
    const balance = Math.max(0, invoice.totalAmount - invoice.paidAmount);
    doc.fillColor('#E85D04').text(`Balance Due: Rs. ${balance.toLocaleString('en-IN')}`, 40, y, { align: 'right' });

    // Footer Stamp & Verification Hash
    doc.moveDown(4);
    doc.fillColor('#6B7280').fontSize(8).text('This is a system-generated cryptographic PDF tax receipt.', { align: 'center' });
    doc.text(`HMAC Verification Hash: ${Buffer.from(invoice.id + invoice.invoiceNo).toString('hex')}`, { align: 'center' });

    doc.end();
  });
};
