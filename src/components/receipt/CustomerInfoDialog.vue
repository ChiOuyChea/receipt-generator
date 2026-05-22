<script setup>
import { computed, useTemplateRef, watch } from 'vue'
import { Eye, Loader2, X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'
import Separator from '../ui/Separator.vue'
import vireakbuthamIcon from '@/assets/vireakbutham.png'
import jalatIcon from '@/assets/jalat.png'
import d2dIcon from '@/assets/d2done.png'

const open = defineModel('open', {
  type: Boolean,
  default: false,
})

const customerInfo = defineModel('customerInfo', {
  type: Object,
  required: true,
})

const props = defineProps({
  errors: {
    type: Object,
    default: () => ({}),
  },
  isGenerating: {
    type: Boolean,
    default: false,
  },
  finalTotal: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['create-pdf', 'preview'])
const firstField = useTemplateRef('firstField')
const { t } = useI18n()

const dialogClasses = computed(() => [
  'fixed inset-0 z-40 grid place-items-center bg-black/50 p-4 transition-opacity duration-200',
  open.value ? '' : 'hidden',
])

watch(open, (value) => {
  if (value) {
    window.setTimeout(() => firstField.value?.focus(), 0)
  }
})

function updateField(field, value) {
  customerInfo.value = {
    ...customerInfo.value,
    [field]: value,
  }
}

function sanitizeNumber(field, event) {
  updateField(field, event.target.value.replace(/[^\d.]/g, ''))
}

const deliveryServices = computed(() => [
  { value: 'vireakbutham', label: t('pdf.services.vireakbutham'), icon: vireakbuthamIcon },
  { value: 'jalat', label: t('pdf.services.jalat'), icon: jalatIcon },
  { value: 'd2d', label: t('pdf.services.d2d'), icon: d2dIcon },
  { value: 'other', label: t('dialog.deliveryServiceOther'), icon: null },
])
</script>

<template>
  <Teleport to="body">
    <div :class="dialogClasses" role="dialog" aria-modal="true" aria-labelledby="customer-dialog-title">
      <form class="flex max-h-[90svh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#252320]" @submit.prevent="emit('create-pdf')">
        <div class="flex items-start justify-between gap-4 p-6">
          <div>
            <h2 id="customer-dialog-title" class="text-lg font-semibold text-black dark:text-[#f7f7f7]">{{ t('dialog.title') }}</h2>
            <p class="mt-1 text-sm text-[#6b5a50] dark:text-[#b09080]">{{ t('dialog.description') }}</p>
          </div>
          <Button variant="ghost" size="icon" :aria-label="t('dialog.close')" @click="open = false">
            <X class="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <Separator />

        <div class="space-y-5 overflow-y-auto p-6">
          <div>
            <label class="mb-1 block text-sm font-medium text-[#854836]" for="customer-name">{{ t('dialog.customerName') }}</label>
            <Input
              id="customer-name"
              ref="firstField"
              :model-value="customerInfo.customerName"
              :placeholder="t('dialog.optional')"
              @update:model-value="updateField('customerName', $event)"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-[#854836]" for="phone-number">{{ t('dialog.phoneNumber') }}</label>
            <Input
              id="phone-number"
              :model-value="customerInfo.phoneNumber"
              :invalid="Boolean(errors.phoneNumber)"
              placeholder="+855 12 345 678"
              @update:model-value="updateField('phoneNumber', $event)"
            />
            <p v-if="errors.phoneNumber" class="mt-1 text-xs text-rose-600">{{ errors.phoneNumber }}</p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-[#854836]" for="delivery-address">{{ t('dialog.deliveryAddress') }}</label>
            <textarea
              id="delivery-address"
              :value="customerInfo.deliveryAddress"
              :class="[
                'min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm text-black outline-none transition placeholder:text-[#a0856e] focus:border-[#FFB22C] focus:ring-2 focus:ring-[#fff1d8] dark:bg-[#1e1b18] dark:text-[#f7f7f7] dark:placeholder:text-[#7a6050] dark:focus:ring-[#2a1f15]',
                errors.deliveryAddress ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20' : 'border-[#eadfce] dark:border-[#3d2e28]',
              ]"
              :placeholder="t('dialog.addressPlaceholder')"
              @input="updateField('deliveryAddress', $event.target.value)"
            />
            <p v-if="errors.deliveryAddress" class="mt-1 text-xs text-rose-600">{{ errors.deliveryAddress }}</p>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-[#854836]">{{ t('dialog.deliveryService') }}</label>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                v-for="service in deliveryServices"
                :key="service.value"
                type="button"
                :class="[
                  'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors',
                  customerInfo.deliveryService === service.value
                    ? 'border-[#FFB22C] bg-[#fff8ed] text-[#854836] dark:bg-[#2a1f15]'
                    : 'border-[#eadfce] text-[#6b5a50] hover:border-[#FFB22C] dark:border-[#3d2e28] dark:text-[#b09080]',
                ]"
                @click="updateField('deliveryService', service.value)"
              >
                <img v-if="service.icon" :src="service.icon" :alt="service.label" class="h-8 w-8 rounded object-contain" />
                <span v-else class="flex h-8 w-8 items-center justify-center rounded bg-[#eadfce] text-base dark:bg-[#3d2e28]">?</span>
                <span>{{ service.label }}</span>
              </button>
            </div>
            <Input
              v-if="customerInfo.deliveryService === 'other'"
              class="mt-2"
              :model-value="customerInfo.deliveryServiceCustom"
              :placeholder="t('dialog.deliveryServiceOtherPlaceholder')"
              @update:model-value="updateField('deliveryServiceCustom', $event)"
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-[#854836]" for="delivery-fee">{{ t('dialog.deliveryFee') }}</label>
              <Input
                id="delivery-fee"
                inputmode="decimal"
                :model-value="customerInfo.deliveryFee"
                :invalid="Boolean(errors.deliveryFee)"
                placeholder="0.00"
                @input="sanitizeNumber('deliveryFee', $event)"
              />
              <p v-if="errors.deliveryFee" class="mt-1 text-xs text-rose-600">{{ errors.deliveryFee }}</p>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-[#854836]" for="fixed-total">{{ t('dialog.fixedTotal') }}</label>
              <Input
                id="fixed-total"
                inputmode="decimal"
                :model-value="customerInfo.fixedTotalPrice"
                :invalid="Boolean(errors.fixedTotalPrice)"
                :placeholder="t('dialog.optional')"
                @input="sanitizeNumber('fixedTotalPrice', $event)"
              />
              <p v-if="errors.fixedTotalPrice" class="mt-1 text-xs text-rose-600">{{ errors.fixedTotalPrice }}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div class="sticky bottom-0 flex flex-col gap-3 bg-white p-6 dark:bg-[#252320] sm:flex-row sm:items-center sm:justify-between">
          <div class="text-sm text-[#6b5a50] dark:text-[#b09080]">
            {{ t('summary.finalTotal') }}
            <span class="ml-2 text-lg font-bold text-black dark:text-[#f7f7f7]">{{ finalTotal }}</span>
          </div>
          <div class="flex gap-2">
            <Button type="button" variant="outline" @click="emit('preview')">
              <Eye class="h-4 w-4" aria-hidden="true" />
              {{ t('app.preview') }}
            </Button>
            <Button type="submit" :disabled="isGenerating">
              <Loader2 v-if="isGenerating" class="h-4 w-4 animate-spin" aria-hidden="true" />
              {{ t('dialog.createPdf') }}
            </Button>
          </div>
        </div>
      </form>
    </div>
  </Teleport>
</template>
