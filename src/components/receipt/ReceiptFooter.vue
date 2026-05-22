<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBusinessInfoStore } from '../../stores/businessInfoStore'

defineProps({
  notes: {
    type: String,
    default: '',
  },
})

const { t } = useI18n()
const businessInfo = useBusinessInfoStore()

const contactText = computed(() => {
  if (businessInfo.shopPhone) {
    return t('pdf.contact').replace(t('pdf.shopPhone'), businessInfo.shopPhone)
  }
  return t('pdf.contact')
})
</script>

<template>
  <footer class="pdf-footer">
    <div class="pdf-footer-grid">
      <div>
        <p class="pdf-footer-title">{{ t('pdf.thanks') }}</p>
        <p class="pdf-footer-copy">{{ contactText }}</p>
        <p class="pdf-notes">{{ notes || t('pdf.notes') }}</p>
      </div>
      <div class="pdf-qr">{{ t('pdf.qr') }}</div>
    </div>
  </footer>
</template>

<style scoped>
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
</style>
