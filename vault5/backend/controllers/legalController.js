
/**
 * Simple in-memory User Agreement content.
 * In a future iteration we can load this from a markdown source or CMS.
 */
const USER_AGREEMENT_TITLE = 'Vault5 User Agreement';
const USER_AGREEMENT_LAST_UPDATED = 'Last updated: September 19, 2025';
const USER_AGREEMENT_SECTIONS = [
  { h: 'About Your Account', t: 'Welcome to Vault5! This agreement governs your use of your Vault5 account and services.' },
  { h: 'Opening a Vault5 Account', t: 'We offer personal and business accounts. You must meet applicable eligibility requirements to open and use your account.' },
  { h: 'Closing Your Account', t: 'You may close your account at any time. Outstanding obligations may remain after closure as allowed by law.' },
  { h: 'Link or Unlink a Payment Method', t: 'You can link/unlink payment methods such as mobile wallets and bank accounts, subject to verification and policies.' },
  { h: 'Receiving Funds or Transferring Funds', t: 'All references to “funds” refer to sovereign currency, not crypto. Availability and withdrawal may be subject to review and KYC.' },
  { h: 'Taxes and Information Reporting', t: 'You are responsible for understanding and meeting your tax obligations. Vault5 may be required to provide certain reports to authorities.' },
  { h: 'Account Statements', t: 'You can view statements within Vault5. Some statements may be emailed or generated on request.' },
  { h: 'Sending Money and Buying', t: 'When you send money or purchase services, you authorize the selected payment method according to applicable terms.' },
  { h: 'Selling and Accepting Payments', t: 'Merchants must comply with our policies and applicable laws, including no surcharging and accurate representations.' },
  { h: 'Restricted Activities, Holds, and Other Actions', t: 'Certain activities are prohibited. We may hold funds or limit accounts to manage risk or comply with law.' },
  { h: 'Liability for Unauthorized Transactions and Errors', t: 'Review your statements. Report unauthorized transactions and errors in a timely manner.' },
  { h: 'Other Legal Terms', t: 'This section includes governing law, communications, arbitration clauses, and additional legal notices.' },
];

/**
 * GET /api/legal/user-agreement.pdf
 * Streams a PDF version of the User Agreement.
 */
const downloadUserAgreementPDF = async (req, res) => {
  try {
    // Lazy-load pdfkit to avoid crashing server at startup if dependency is missing
    let PDFDocument;
    try {
      PDFDocument = require('pdfkit');
    } catch (loadErr) {
      console.error('pdfkit not installed or failed to load:', loadErr?.message || loadErr);
      return res.status(500).json({ message: 'PDF generation library not available' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Vault5-User-Agreement.pdf"');

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    // Header
    doc.fontSize(20).text(USER_AGREEMENT_TITLE, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555').text(USER_AGREEMENT_LAST_UPDATED, { align: 'center' });
    doc.moveDown(1.0);
    doc.fillColor('black');

    // Body
    USER_AGREEMENT_SECTIONS.forEach((sec, idx) => {
      doc.fontSize(14).text(`${idx + 1}. ${sec.h}`, { underline: true });
      doc.moveDown(0.2);
      doc.fontSize(11).text(sec.t, { align: 'justify' });
      doc.moveDown(0.8);
    });

    // Footer
    doc.moveDown(1.0);
    doc.fontSize(10).fillColor('#666').text('© Vault5. All rights reserved.', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('downloadUserAgreementPDF error:', err);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};

module.exports = {
  downloadUserAgreementPDF,
};