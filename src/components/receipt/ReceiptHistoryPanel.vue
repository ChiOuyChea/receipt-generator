<script setup>
import { Copy, Eye, Trash2, X } from 'lucide-vue-next'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from '../ui/Button.vue'
import Separator from '../ui/Separator.vue'
import { formatCurrency } from '../../lib/utils'

const open = defineModel('open', {
  type: Boolean,
  default: false,
})

defineProps({
  history: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['duplicate', 'delete'])
const { t } = useI18n()
const expandedId = ref(null)

function toggleDetails(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatHistoryDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-panel-title"
    >
      <div class="flex max-h-[90svh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#252320]">
        <div class="flex items-start justify-between gap-4 p-6">
          <div>
            <h2 id="history-panel-title" class="text-lg font-semibold text-black dark:text-[#f7f7f7]">{{ t('history.title') }}</h2>
            <p class="mt-1 text-sm text-[#6b5a50] dark:text-[#b09080]">{{ t('history.description') }}</p>
          </div>
          <Button variant="ghost" size="icon" :aria-label="t('history.close')" @click="open = false">
            <X class="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <Separator />

        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="!history.length" class="rounded-xl border border-dashed border-[#eadfce] bg-[#fff8ed] p-8 text-center text-sm text-[#6b5a50] dark:border-[#3d2e28] dark:bg-[#2a1f15] dark:text-[#b09080]">
            {{ t('history.empty') }}
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="entry in history"
              :key="entry.id"
              class="rounded-lg border border-[#eadfce] bg-white p-4 dark:border-[#3d2e28] dark:bg-[#1e1b18]"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-black dark:text-[#f7f7f7]">{{ entry.receiptNumber }}</p>
                  <p class="mt-0.5 text-sm text-[#6b5a50] dark:text-[#b09080]">
                    {{ entry.customerInfo?.customerName || t('pdf.walkIn') }}
                    <span class="mx-1">&middot;</span>
                    <span class="font-medium text-black dark:text-[#f7f7f7]">{{ formatCurrency(entry.totals?.finalTotal || 0) }}</span>
                    <span class="mx-1">&middot;</span>
                    <span class="capitalize">{{ entry.templateType }}</span>
                  </p>
                  <p class="mt-0.5 text-xs text-[#a0856e] dark:text-[#7a6050]">
                    {{ t('history.createdAt') }}: {{ formatHistoryDate(entry.createdAt) }}
                  </p>
                </div>
                <div class="flex gap-1">
                  <Button variant="ghost" size="icon" :aria-label="t('history.viewDetails')" @click="toggleDetails(entry.id)">
                    <Eye class="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" :aria-label="t('history.duplicate')" @click="emit('duplicate', entry)">
                    <Copy class="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" class="text-rose-600 hover:text-rose-700" :aria-label="t('history.delete')" @click="emit('delete', entry.id)">
                    <Trash2 class="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div v-if="expandedId === entry.id" class="mt-3 border-t border-[#eadfce] pt-3 dark:border-[#3d2e28]">
                <div class="space-y-1 text-sm text-[#6b5a50] dark:text-[#b09080]">
                  <p><span class="font-medium text-black dark:text-[#f7f7f7]">{{ t('dialog.phoneNumber') }}:</span> {{ entry.customerInfo?.phoneNumber }}</p>
                  <p><span class="font-medium text-black dark:text-[#f7f7f7]">{{ t('dialog.deliveryAddress') }}:</span> {{ entry.customerInfo?.deliveryAddress }}</p>
                  <p v-if="entry.customerInfo?.notes"><span class="font-medium text-black dark:text-[#f7f7f7]">{{ t('dialog.notes') }}:</span> {{ entry.customerInfo.notes }}</p>
                </div>
                <div class="mt-2 space-y-1">
                  <div v-for="product in entry.products" :key="product.id" class="flex justify-between text-sm">
                    <span class="text-black dark:text-[#f7f7f7]">{{ product.name }} &times; {{ product.quantity }}</span>
                    <span class="text-[#6b5a50] dark:text-[#b09080]">{{ formatCurrency(Number(product.quantity) * Number(product.unitPrice)) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
