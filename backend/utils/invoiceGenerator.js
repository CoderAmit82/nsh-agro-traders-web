const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (order, user, payment) => {
  return new Promise((resolve, reject) => {
    try {
      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(__dirname, '..', 'uploads', 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `invoice_${order._id}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      // Pipe to file
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- PDF Header ---
      doc
        .fillColor('#1e3f20')
        .fontSize(22)
        .text('NSH Agro Traders', 50, 50, { bold: true })
        .fontSize(10)
        .fillColor('#333333')
        .text('Your Trusted Partner in Modern Farming', 50, 75)
        .text('123 Green Valley Road, Agro Zone', 50, 90)
        .text('Email: support@nshagro.com | Tel: +91 98765 43210', 50, 105);

      doc
        .fontSize(20)
        .fillColor('#1e3f20')
        .text('INVOICE', 400, 50, { align: 'right' })
        .fontSize(10)
        .fillColor('#333333')
        .text(`Invoice ID: ${order._id.toString().substring(0, 12)}...`, 400, 75, { align: 'right' })
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 90, { align: 'right' })
        .text(`Payment Status: ${payment ? payment.status.toUpperCase() : 'PENDING'}`, 400, 105, { align: 'right' });

      // Draw a line
      doc.moveTo(50, 130).lineTo(550, 130).stroke('#1e3f20');

      // --- Farmer & Shipping Details ---
      doc
        .fontSize(12)
        .fillColor('#1e3f20')
        .text('Billed To (Farmer):', 50, 150, { bold: true })
        .fontSize(10)
        .fillColor('#333333')
        .text(`Name: ${user.name}`, 50, 170)
        .text(`Mobile: ${user.mobile}`, 50, 185)
        .text(`Email: ${user.email}`, 50, 200);

      doc
        .fontSize(12)
        .fillColor('#1e3f20')
        .text('Shipping Address:', 300, 150, { bold: true })
        .fontSize(10)
        .fillColor('#333333')
        .text(`${order.shippingAddress.street}`, 300, 170)
        .text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, 300, 185)
        .text(`ZIP Code: ${order.shippingAddress.zip}`, 300, 200);

      // Draw a line
      doc.moveTo(50, 225).lineTo(550, 225).stroke('#e0e0e0');

      // --- Items Table Headers ---
      const tableTop = 245;
      doc
        .fontSize(10)
        .fillColor('#1e3f20')
        .text('Item Description', 50, tableTop, { bold: true })
        .text('Category', 220, tableTop, { bold: true })
        .text('Qty', 320, tableTop, { align: 'right', bold: true })
        .text('Unit Price', 380, tableTop, { align: 'right', bold: true })
        .text('Discount', 440, tableTop, { align: 'right', bold: true })
        .text('Amount', 500, tableTop, { align: 'right', bold: true });

      doc.moveTo(50, 260).lineTo(550, 260).stroke('#1e3f20');

      // --- Table Rows ---
      let currentY = 270;
      order.items.forEach((item, index) => {
        const itemTotal = item.quantity * item.priceAtPurchase;
        const prodName = item.product.name || 'Agro Product';
        const prodCat = item.product.category || 'Agricultural';

        doc
          .fillColor('#333333')
          .text(prodName.length > 25 ? prodName.substring(0, 22) + '...' : prodName, 50, currentY)
          .text(prodCat, 220, currentY)
          .text(item.quantity.toString(), 320, currentY, { align: 'right' })
          .text(`Rs. ${item.priceAtPurchase.toFixed(2)}`, 380, currentY, { align: 'right' })
          .text(`${item.product.discount || 0}%`, 440, currentY, { align: 'right' })
          .text(`Rs. ${itemTotal.toFixed(2)}`, 500, currentY, { align: 'right' });

        currentY += 20;

        // Page break if too many items (simple fallback)
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }
      });

      doc.moveTo(50, currentY).lineTo(550, currentY).stroke('#e0e0e0');
      currentY += 15;

      // --- Total Calculations ---
      const totalAmount = order.totalAmount;
      const paid = payment ? payment.paidAmount : 0;
      const pending = payment ? payment.pendingAmount : totalAmount;

      doc
        .fontSize(10)
        .fillColor('#1e3f20')
        .text('Total Order Value:', 350, currentY, { bold: true })
        .text(`Rs. ${totalAmount.toFixed(2)}`, 500, currentY, { align: 'right', bold: true });

      currentY += 15;
      doc
        .fillColor('#333333')
        .text('Amount Paid:', 350, currentY)
        .text(`Rs. ${paid.toFixed(2)}`, 500, currentY, { align: 'right' });

      currentY += 15;
      doc
        .fontSize(11)
        .fillColor('#d32f2f')
        .text('Balance Pending:', 350, currentY, { bold: true })
        .text(`Rs. ${pending.toFixed(2)}`, 500, currentY, { align: 'right', bold: true });

      // --- Footer Note ---
      doc
        .fontSize(10)
        .fillColor('#2e7d32')
        .text('Thank you for choosing NSH Agro Traders!', 50, 720, { align: 'center', italic: true })
        .fillColor('#777777')
        .fontSize(8)
        .text('This is a computer-generated invoice and requires no signature.', 50, 740, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(fileName);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateInvoice;
