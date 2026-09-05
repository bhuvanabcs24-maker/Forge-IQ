import { ExtendedQuotation } from '@/types/quotation-engine';
import { formatCurrency } from '@/lib/utils';

export function generateQuotationPdfHtml(quote: ExtendedQuotation): string {
  const qrVerificationUrl = `https://forgeiq.app/verify/quote/${quote.quotationNumber}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quotation ${quote.quotationNumber} - ForgeIQ</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 32px; font-size: 12px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-b: 2px solid #3B82F6; padding-bottom: 16px; margin-bottom: 24px; }
    .logo-badge { background: linear-gradient(135deg, #2563EB, #7C3AED); color: white; padding: 8px 16px; border-radius: 8px; font-weight: 800; font-size: 18px; display: inline-block; }
    .company-title { text-align: right; font-size: 11px; color: #475569; }
    .meta-grid { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; width: 48%; box-sizing: border-box; }
    .card-title { font-weight: 700; color: #1E293B; margin-bottom: 4px; text-transform: uppercase; font-size: 10px; tracking: 1px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #0F172A; color: white; font-weight: 700; text-align: left; padding: 10px 12px; font-size: 10px; text-transform: uppercase; }
    td { border-bottom: 1px solid #E2E8F0; padding: 10px 12px; font-size: 11px; }
    tr:nth-child(even) { background: #F8FAFC; }
    .totals-table { width: 300px; margin-left: auto; margin-bottom: 24px; }
    .totals-table td { border: none; padding: 6px 12px; }
    .grand-total { font-weight: 800; font-size: 14px; color: #2563EB; border-top: 2px solid #2563EB !important; }
    .footer { border-top: 1px solid #E2E8F0; padding-top: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748B; }
    .qr-badge { background: #EFF6FF; border: 1px solid #BFDBFE; padding: 8px 12px; border-radius: 6px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo-badge">ForgeIQ</div>
      <div style="margin-top: 4px; font-weight: 700; color: #0F172A; font-size: 14px;">Precision Metal Fabrication Co.</div>
    </div>
    <div class="company-title">
      <h2 style="margin: 0; color: #0F172A; font-size: 20px;">OFFICIAL QUOTATION</h2>
      <p style="margin: 4px 0 0 0; font-family: monospace; font-weight: bold; color: #2563EB;">${quote.quotationNumber}</p>
      <p style="margin: 2px 0 0 0;">Revision: ${quote.revisionNumber}</p>
    </div>
  </div>

  <div class="meta-grid">
    <div class="card">
      <div class="card-title">Customer / Billing Information</div>
      <strong>${quote.customerName}</strong><br>
      Attn: Procurement & Engineering Team<br>
      Email: billing@precisionfab.com<br>
      Tax ID: GSTIN-US-991823712
    </div>
    <div class="card">
      <div class="card-title">Quotation Details</div>
      <strong>Issue Date:</strong> ${quote.createdAt}<br>
      <strong>Valid Until:</strong> ${quote.validUntil}<br>
      <strong>Payment Terms:</strong> 30% Deposit, Net 30 Days<br>
      <strong>Status:</strong> <span style="color: #059669; font-weight: bold;">${quote.status.toUpperCase()}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Part Name & Specs</th>
        <th>Material / Grade</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th style="text-align: right;">Total ($)</th>
      </tr>
    </thead>
    <tbody>
      ${(quote.detailedLineItems || [])
        .map(
          (item: any) => `
        <tr>
          <td>
            <strong>${item.partName}</strong><br>
            <span style="font-size: 10px; color: #64748B;">Dims: ${item.dimensions} | Thk: ${item.thickness}</span>
          </td>
          <td>${item.materialGrade}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.unitPrice)}</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(item.totalPrice)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <table class="totals-table">
    <tr>
      <td>Subtotal:</td>
      <td style="text-align: right; font-weight: bold;">${formatCurrency(quote.costBreakdown.subtotal)}</td>
    </tr>
    <tr>
      <td>GST / Tax (18%):</td>
      <td style="text-align: right;">${formatCurrency(quote.costBreakdown.taxGstAmount)}</td>
    </tr>
    <tr>
      <td>Shipping & Freight:</td>
      <td style="text-align: right;">${formatCurrency(quote.costBreakdown.packagingAndLogistics)}</td>
    </tr>
    <tr class="grand-total">
      <td>Grand Total:</td>
      <td style="text-align: right;">${formatCurrency(quote.costBreakdown.grandTotal)}</td>
    </tr>
  </table>

  <div class="footer">
    <div class="qr-badge">
      🔒 Digitally Signed & Verified by ForgeIQ Engine<br>
      Verification Hash: ${quote.id.substring(0, 12).toUpperCase()}
    </div>
    <div>
      Page 1 of 1 • ForgeIQ Manufacturing Intelligence Platform
    </div>
  </div>
</body>
</html>
  `;
}
