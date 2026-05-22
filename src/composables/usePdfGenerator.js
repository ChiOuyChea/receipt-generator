import { shallowRef } from 'vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const PDF_CAPTURE_CSS = `
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
    font-family: "Kantumruy Pro", "Khmer OS", Inter, Arial, Helvetica, sans-serif !important;
  }

  [data-pdf-capture-root] {
    display: block !important;
    width: 794px !important;
    background: #ffffff !important;
  }

  .pdf-receipt {
    width: 794px;
    padding: 48px;
    background: #ffffff;
    color: #0f172a;
    font-family: "Kantumruy Pro", "Khmer OS", Inter, Arial, Helvetica, sans-serif;
    text-align: left;
    box-sizing: border-box;
  }

  .pdf-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 32px;
    padding-bottom: 32px;
    border-bottom: 2px solid #ffb22c;
  }

  .pdf-brand {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .pdf-logo {
    display: block;
    width: 56px;
    height: 56px;
    border-radius: 8px;
    object-fit: cover;
  }

  .pdf-shop-name {
    margin: 0;
    color: #000000;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
  }

  .pdf-address {
    margin-top: 4px;
  }

  .pdf-muted {
    margin: 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.45;
  }

  .pdf-meta {
    text-align: right;
  }

  .pdf-title {
    margin: 0;
    color: #854836;
    font-size: 30px;
    font-weight: 700;
    line-height: 1.2;
  }

  .pdf-receipt-number {
    margin-top: 12px;
  }

  .pdf-receipt-number span {
    color: #1e293b;
    font-weight: 600;
  }

  .pdf-customer-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 32px;
  }

  .pdf-section-title {
    margin: 32px 0 0 0;
    color: #854836;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  .pdf-customer-name {
    display: flex;
    gap: 8px;
    align-items: baseline;
    margin: 12px 0 0;
    color: #000000;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.45;
    width: 100%;
  }

  .pdf-label {
    color: #475569;
    font-size: 14px;
    line-height: 1.45;
    min-width: 160px;
    display: inline-block;
  }

  .pdf-customer-info {
    display: block;
    margin-left: auto;
  }

  .pdf-copy {
    display: flex;
    gap: 8px;
    align-items: baseline;
    margin: 4px 0 0;
    color: #475569;
    font-size: 14px;
    line-height: 1.45;
    width: 100%;
  }

  .pdf-delivery-box {
    padding: 16px;
    border: 1px solid #eadfce;
    border-radius: 8px;
    background: #fff8ed;
  }

  .pdf-delivery-label {
    margin: 12px 0 0;
    color: #475569;
    font-size: 14px;
    line-height: 1.45;
  }

  .pdf-delivery-fee {
    margin: 0;
    color: #854836;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.45;
  }

  .pdf-table-wrap {
    margin-top: 32px;
  }

  .pdf-table {
    width: 100%;
    border-collapse: collapse;
  }

  .pdf-table th {
    padding: 12px 16px;
    border-bottom: 2px solid #ffb22c;
    color: #854836;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    line-height: 1.3;
    text-align: left;
    text-transform: uppercase;
  }

  .pdf-table th:first-child,
  .pdf-table td:first-child {
    padding-left: 0;
  }

  .pdf-table th:last-child,
  .pdf-table td:last-child {
    padding-right: 0;
  }

  .pdf-table td {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
    line-height: 1.45;
  }

  .pdf-align-right {
    text-align: right !important;
  }

  .pdf-product-name {
    max-width: 290px;
    color: #000000;
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  .pdf-table-copy {
    color: #334155;
  }

  .pdf-line-total {
    color: #000000;
    font-weight: 600;
  }

  .pdf-summary {
    width: 288px;
    margin-top: 32px;
    margin-left: auto;
  }

  .pdf-summary-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 12px;
    color: #475569;
    font-size: 14px;
    line-height: 1.45;
  }

  .pdf-summary-total {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 2px solid #ffb22c;
    color: #000000;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
  }

  .pdf-footer {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #eadfce;
  }

  .pdf-footer-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 24px;
    color: #475569;
    font-size: 14px;
    line-height: 1.45;
  }

  .pdf-footer-title {
    margin: 0;
    color: #000000;
    font-weight: 600;
  }

  .pdf-footer-copy {
    margin: 8px 0 0;
  }

  .pdf-notes {
    margin: 16px 0 0;
    padding: 12px;
    border: 1px dashed #ffb22c;
    border-radius: 6px;
    color: #64748b;
  }

  .pdf-qr {
    display: flex;
    width: 112px;
    height: 112px;
    align-items: center;
    justify-content: center;
    border: 1px dashed #ffb22c;
    border-radius: 6px;
    color: #854836;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-align: center;
    text-transform: uppercase;
  }
`

const PDF_CAPTURE_CSS_ELDERLY = `
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
    font-family: "Kantumruy Pro", "Khmer OS", Inter, Arial, Helvetica, sans-serif !important;
  }

  [data-pdf-capture-root] {
    display: block !important;
    width: 794px !important;
    background: #ffffff !important;
  }

  .pde-receipt {
    width: 794px;
    padding: 48px;
    background: #ffffff;
    color: #000000;
    font-family: "Kantumruy Pro", "Khmer OS", Inter, Arial, Helvetica, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    text-align: left;
    box-sizing: border-box;
  }

  .pde-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 32px;
    padding-bottom: 24px;
    border-bottom: 3px solid #ffb22c;
    margin-bottom: 8px;
  }

  .pde-brand {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .pde-logo {
    display: block;
    width: 64px;
    height: 64px;
    border-radius: 8px;
    object-fit: cover;
  }

  .pde-shop-name {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #000000;
    line-height: 1.3;
  }

  .pde-muted {
    margin: 3px 0 0;
    font-size: 14px;
    color: #555555;
    line-height: 1.45;
  }

  .pde-meta {
    text-align: right;
  }

  .pde-title {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    color: #854836;
    line-height: 1.2;
  }

  .pde-meta-row {
    margin: 6px 0 0;
    font-size: 15px;
    color: #333333;
  }

  .pde-meta-label {
    font-weight: 600;
  }

  .pde-section {
    margin-top: 20px;
    padding: 18px 20px;
    border: 1px solid #eadfce;
    border-radius: 8px;
  }

  .pde-section-title {
    margin: 0 0 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eadfce;
    font-size: 13px;
    font-weight: 700;
    color: #854836;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .pde-label {
    font-weight: 700;
    color: #333333;
    min-width: 160px;
    display: inline-block;
  }

  .pde-info-row {
    margin: 10px 0 0;
    font-size: 16px;
    display: flex;
    gap: 8px;
    align-items: baseline;
  }

  .pde-delivery-amount {
    font-size: 22px;
    font-weight: 700;
    color: #854836;
  }

  .pde-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 15px;
  }

  .pde-table th {
    padding: 10px 12px;
    background: #fff8ed;
    border-top: 1px solid #eadfce;
    border-bottom: 2px solid #ffb22c;
    font-size: 12px;
    font-weight: 700;
    text-align: left;
    color: #854836;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .pde-table td {
    padding: 13px 12px;
    border-bottom: 1px solid #f0e8de;
    color: #000000;
    vertical-align: top;
  }

  .pde-right { text-align: right !important; }

  .pde-index {
    color: #854836;
    font-weight: 700;
    width: 28px;
  }

  .pde-product-name {
    font-weight: 500;
    max-width: 260px;
    overflow-wrap: anywhere;
  }

  .pde-line-total { font-weight: 700; }

  .pde-summary {
    margin-top: 20px;
    padding: 18px 20px;
    border: 1px solid #eadfce;
    border-radius: 8px;
  }

  .pde-summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 16px;
    border-bottom: 1px solid #f5ede4;
    color: #333333;
  }

  .pde-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 16px 0 0;
    border-top: 3px solid #ffb22c;
    font-size: 26px;
    font-weight: 700;
    color: #000000;
  }

  .pde-footer {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #eadfce;
    font-size: 15px;
    color: #555555;
  }

  .pde-thanks {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #000000;
  }

  .pde-contact { margin: 8px 0 0; }

  .pde-notes {
    margin: 12px 0 0;
    padding: 12px 16px;
    border: 1px dashed #ffb22c;
    border-radius: 6px;
    font-size: 14px;
    color: #555555;
  }
`

function preparePdfClone(documentClone, captureId, template = 'standard') {
  documentClone.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => node.remove())

  const style = documentClone.createElement('style')
  style.textContent = template === 'elderly' ? PDF_CAPTURE_CSS_ELDERLY : PDF_CAPTURE_CSS
  documentClone.head.appendChild(style)

  documentClone.documentElement.style.background = '#ffffff'
  documentClone.body.style.background = '#ffffff'
  documentClone.body.style.color = '#0f172a'

  documentClone.querySelectorAll('body > *').forEach((node) => {
    if (!node.querySelector?.(`[data-pdf-capture-root="${captureId}"]`)) {
      node.setAttribute('style', 'display: none !important;')
    }
  })
}

export function usePdfGenerator() {
  const isGenerating = shallowRef(false)

  async function generatePdf(element, receiptNumber, template = 'standard') {
    if (!element) {
      throw new Error('Receipt preview is not available.')
    }

    isGenerating.value = true
    const captureId = crypto.randomUUID()
    element.setAttribute('data-pdf-capture-root', captureId)

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (documentClone) => preparePdfClone(documentClone, captureId, template),
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imageWidth = pageWidth
      const imageHeight = (canvas.height * imageWidth) / canvas.width
      let heightLeft = imageHeight
      let position = 0

      const imageData = canvas.toDataURL('image/png')
      pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${receiptNumber}.pdf`)
    } finally {
      element.removeAttribute('data-pdf-capture-root')
      isGenerating.value = false
    }
  }

  return {
    isGenerating,
    generatePdf,
  }
}
