<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import logo from '@/assets/r1.jpg'
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
  <article class="pde-receipt">
    <!-- Header -->
    <header class="pde-header">
      <div class="pde-brand">
        <img class="pde-logo" :src="logo" alt="ChiOuy Logo" />
        <div>
          <p class="pde-shop-name">{{ t('pdf.shopName') }}</p>
          <p class="pde-muted">{{ t('pdf.shopAddress') }}</p>
          <p class="pde-muted">{{ t('pdf.shopPhone') }}</p>
        </div>
      </div>
      <div class="pde-meta">
        <h1 class="pde-title">{{ t('pdf.title') }}</h1>
        <p class="pde-meta-row">
          <span class="pde-meta-label">{{ t('pdf.number') }}:</span> {{ receiptNumber }}
        </p>
        <p class="pde-meta-row">
          <span class="pde-meta-label">{{ t('summary.receiptDate') }}:</span> {{ receiptDate }}
        </p>
      </div>
    </header>

    <!-- Customer Information -->
    <section class="pde-section">
      <h2 class="pde-section-title">{{ t('pdf.customer') }}</h2>
      <p v-if="customerInfo.customerName" class="pde-info-row">
        <span class="pde-label">{{ t('dialog.customerName') }}:</span>
        <span>{{ customerInfo.customerName }}</span>
      </p>
      <p v-else class="pde-info-row">
        <span class="pde-label">{{ t('dialog.customerName') }}:</span>
        <span>{{ t('pdf.walkIn') }}</span>
      </p>
      <p class="pde-info-row">
        <span class="pde-label">{{ t('dialog.phoneNumber') }}:</span>
        <span>{{ customerInfo.phoneNumber }}</span>
      </p>
      <p class="pde-info-row">
        <span class="pde-label">{{ t('dialog.deliveryAddress') }}:</span>
        <span>{{ customerInfo.deliveryAddress }}</span>
      </p>
      <p v-if="deliveryServiceName" class="pde-info-row">
        <span class="pde-label">{{ t('pdf.deliveryService') }}:</span>
        <span>{{ deliveryServiceName }}</span>
      </p>
    </section>

    <!-- Products -->
    <section class="pde-section">
      <h2 class="pde-section-title">{{ t('products.title') }}</h2>
      <table class="pde-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ t('pdf.productName') }}</th>
            <th class="pde-right">{{ t('pdf.quantity') }}</th>
            <th class="pde-right">{{ t('pdf.unitPrice') }}</th>
            <th class="pde-right">{{ t('pdf.total') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(product, index) in products" :key="product.id">
            <td class="pde-index">{{ index + 1 }}</td>
            <td class="pde-product-name">{{ product.name }}</td>
            <td class="pde-right">{{ product.quantity }}</td>
            <td class="pde-right">{{ formatCurrency(product.unitPrice) }}</td>
            <td class="pde-right pde-line-total">
              {{ formatCurrency(Number(product.quantity) * Number(product.unitPrice)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Summary -->
    <section class="pde-summary">
      <div class="pde-summary-row">
        <span class="pde-label">{{ t('pdf.subtotal') }}:</span>
        <span>{{ formatCurrency(totals.subtotal) }}</span>
      </div>
      <div class="pde-summary-row">
        <span class="pde-label">{{ t('pdf.deliveryFee') }}:</span>
        <span>{{ formatCurrency(totals.deliveryFee) }}</span>
      </div>
      <div class="pde-summary-row">
        <span class="pde-label">{{ t('pdf.discount') }}:</span>
        <span>{{ formatCurrency(0) }}</span>
      </div>
      <div class="pde-total-row">
        <span>{{ t('pdf.finalTotal') }}</span>
        <span>{{ formatCurrency(totals.finalTotal) }}</span>
      </div>
    </section>

    <!-- Footer -->
    <footer class="pde-footer">
      <p class="pde-thanks">{{ t('pdf.thanks') }}</p>
      <p class="pde-contact">{{ t('pdf.contact') }}</p>
      <p class="pde-notes">{{ t('pdf.notes') }}</p>
    </footer>
  </article>
</template>

<style scoped>
.pde-receipt {
  width: 794px;
  padding: 48px;
  background: #ffffff;
  color: #000000;
  font-family: 'Kantumruy Pro', 'Khmer OS', Inter, Arial, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  text-align: left;
}

/* ─── Header ─── */
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

/* ─── Sections ─── */
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

/* ─── Table ─── */
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

.pde-table th:first-child {
  border-radius: 4px 0 0 0;
}

.pde-table td {
  padding: 13px 12px;
  border-bottom: 1px solid #f0e8de;
  color: #000000;
  vertical-align: top;
}

.pde-right {
  text-align: right !important;
}

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

.pde-line-total {
  font-weight: 700;
}

/* ─── Summary ─── */
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

/* ─── Footer ─── */
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

.pde-contact {
  margin: 8px 0 0;
}

.pde-notes {
  margin: 12px 0 0;
  padding: 12px 16px;
  border: 1px dashed #ffb22c;
  border-radius: 6px;
  font-size: 14px;
  color: #555555;
}
</style>
