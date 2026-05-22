<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ReceiptHeader from './ReceiptHeader.vue'
import ReceiptFooter from './ReceiptFooter.vue'
import { formatCurrency } from '../../lib/utils'

const { t } = useI18n()

const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  customerInfo: {
    type: Object,
    required: true,
  },
  totals: {
    type: Object,
    required: true,
  },
  receiptNumber: {
    type: String,
    required: true,
  },
  receiptDate: {
    type: String,
    required: true,
  },
})

const deliveryServiceName = computed(() => {
  const service = props.customerInfo.deliveryService
  if (!service) return ''
  if (service === 'other') return props.customerInfo.deliveryServiceCustom || ''
  const map = {
    vireakbutham: t('pdf.services.vireakbutham'),
    jalat: t('pdf.services.jalat'),
    d2d: t('pdf.services.d2d'),
  }
  return map[service] || ''
})
</script>

<template>
  <article class="pdf-receipt">
    <ReceiptHeader :receipt-number="receiptNumber" :receipt-date="receiptDate" />

    <h2 class="pdf-section-title">{{ t('pdf.customer') }}</h2>
    <section class="pdf-customer-grid">
      <div>
        <p class="pdf-customer-name">
          <span class="pdf-label">{{ t('dialog.customerName') }}:</span>
        </p>
        <p class="pdf-copy">
          <span class="pdf-label">{{ t('dialog.phoneNumber') }}:</span>
        </p>
        <p class="pdf-copy">
          <span class="pdf-label">{{ t('dialog.deliveryAddress') }}:</span>
        </p>
        <p v-if="deliveryServiceName" class="pdf-copy">
          <span class="pdf-label">{{ t('pdf.deliveryService') }}:</span>
        </p>
      </div>
      <div>
        <p class="pdf-customer-name">
          <span class="pdf-customer-info">{{ customerInfo.customerName || t('pdf.walkIn') }}</span>
        </p>
        <p class="pdf-copy">
          <span class="pdf-customer-info">{{ customerInfo.phoneNumber }}</span>
        </p>
        <p class="pdf-copy">
          <span class="pdf-customer-info">{{ customerInfo.deliveryAddress }}</span>
        </p>
        <p v-if="deliveryServiceName" class="pdf-copy">
          <span class="pdf-customer-info">{{ deliveryServiceName }}</span>
        </p>
      </div>
    </section>

    <section class="pdf-table-wrap">
      <table class="pdf-table">
        <thead>
          <tr>
            <th>{{ t('pdf.productName') }}</th>
            <th class="pdf-align-right">{{ t('pdf.quantity') }}</th>
            <th class="pdf-align-right">{{ t('pdf.unitPrice') }}</th>
            <th class="pdf-align-right">{{ t('pdf.total') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td class="pdf-product-name">{{ product.name }}</td>
            <td class="pdf-align-right pdf-table-copy">{{ product.quantity }}</td>
            <td class="pdf-align-right pdf-table-copy">{{ formatCurrency(product.unitPrice) }}</td>
            <td class="pdf-align-right pdf-line-total">
              {{ formatCurrency(Number(product.quantity) * Number(product.unitPrice)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="pdf-summary">
      <div class="pdf-summary-row">
        <span>{{ t('pdf.subtotal') }}</span>
        <span>{{ formatCurrency(totals.subtotal) }}</span>
      </div>
      <div class="pdf-summary-row">
        <span>{{ t('pdf.deliveryFee') }}</span>
        <span>{{ formatCurrency(totals.deliveryFee) }}</span>
      </div>
      <div class="pdf-summary-row">
        <span>{{ t('pdf.discount') }}</span>
        <span>{{ formatCurrency(totals.discount) }}</span>
      </div>
      <div class="pdf-summary-total">
        <span>{{ t('pdf.finalTotal') }}</span>
        <span>{{ formatCurrency(totals.finalTotal) }}</span>
      </div>
    </section>

    <ReceiptFooter :notes="customerInfo.notes" />
  </article>
</template>

<style scoped>
.pdf-receipt {
  width: 794px;
  padding: 48px;
  background: #ffffff;
  color: #0f172a;
  font-family: 'Kantumruy Pro', 'Khmer OS', Inter, Arial, Helvetica, sans-serif;
  text-align: left;
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

.pdf-table th:first-child {
  padding-left: 0;
}

.pdf-table th:last-child {
  padding-right: 0;
}

.pdf-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  line-height: 1.45;
}

.pdf-table td:first-child {
  padding-left: 0;
}

.pdf-table td:last-child {
  padding-right: 0;
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
</style>
