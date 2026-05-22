<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBusinessInfoStore } from '../../stores/businessInfoStore'

const { t } = useI18n()
const businessInfo = useBusinessInfoStore()

defineProps({
  receiptNumber: {
    type: String,
    required: true,
  },
  receiptDate: {
    type: String,
    required: true,
  },
})

const shopName = computed(() => businessInfo.shopName || t('pdf.shopName'))
const shopAddress = computed(() => businessInfo.shopAddress || t('pdf.shopAddress'))
const shopPhone = computed(() => businessInfo.shopPhone || t('pdf.shopPhone'))
</script>

<template>
  <header class="pdf-header">
    <div class="pdf-brand">
      <img class="pdf-logo" :src="businessInfo.effectiveLogoUrl" alt="Shop Logo" />
      <div>
        <p class="pdf-shop-name">{{ shopName }}</p>
        <p class="pdf-muted pdf-address">{{ shopAddress }}</p>
        <p class="pdf-muted">{{ shopPhone }}</p>
      </div>
    </div>
    <div class="pdf-meta">
      <h1 class="pdf-title">{{ t('pdf.title') }}</h1>
      <p class="pdf-muted pdf-receipt-number">
        {{ t('pdf.number') }} <span>{{ receiptNumber }}</span>
      </p>
      <p class="pdf-muted">{{ receiptDate }}</p>
    </div>
  </header>
</template>

<style scoped>
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
  display: flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
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
</style>
