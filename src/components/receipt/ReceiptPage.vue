<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import { Copy, Eye, FileDown, History, Loader2, Moon, PackageCheck, ReceiptText, Settings, Sun, Truck, X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import Button from '../ui/Button.vue'
import Card from '../ui/Card.vue'
import Input from '../ui/Input.vue'
import Separator from '../ui/Separator.vue'
import Toast from '../ui/Toast.vue'
import KbdBadge from '../ui/KbdBadge.vue'
import AppLanguageSwitcher from './AppLanguageSwitcher.vue'
import ProductTable from './ProductTable.vue'
import CustomerInfoDialog from './CustomerInfoDialog.vue'
import BusinessInfoDialog from './BusinessInfoDialog.vue'
import ReceiptPreview from './ReceiptPreview.vue'
import ReceiptPreviewElderly from './ReceiptPreviewElderly.vue'
import ReceiptHistoryPanel from './ReceiptHistoryPanel.vue'
import { usePdfGenerator } from '../../composables/usePdfGenerator'
import { useReceiptHistory } from '../../composables/useReceiptHistory'
import { useReceiptStore } from '../../stores/receiptStore'
import { useSettingsStore, PAPER_PRESETS } from '../../stores/settingsStore'
import { useBusinessInfoStore } from '../../stores/businessInfoStore'
import { formatCurrency } from '../../lib/utils'
import appLogo from '@/assets/receipt-generator.png'

const { t } = useI18n()

const receipt = useReceiptStore()
const settings = useSettingsStore()
const businessInfo = useBusinessInfoStore()

receipt._initPersistence()
settings._initPersistence()
businessInfo._initPersistence()

const isDialogOpen = shallowRef(false)
const isPreviewOpen = shallowRef(false)
const isBusinessInfoOpen = shallowRef(false)
const toast = shallowRef(null)
const receiptElement = useTemplateRef('receiptElement')

const { isGenerating, isCopying, generatePdf, copyAsImage } = usePdfGenerator()
const { history, addEntry, deleteEntry, getUniqueProductNames } = useReceiptHistory()
const isHistoryOpen = shallowRef(false)
const productSuggestions = computed(() => getUniqueProductNames())

const paperSizeOptions = ['a4', 'a5', 'a6', 'custom']

const summaryCards = computed(() => [
  {
    label: t('summary.products'),
    value: receipt.products.length,
    detail: t('summary.units', { count: receipt.totalQuantity }),
    icon: PackageCheck,
  },
  {
    label: t('summary.subtotal'),
    value: formatCurrency(receipt.subtotal),
    detail: t('summary.beforeDelivery'),
    icon: ReceiptText,
  },
  {
    label: t('summary.finalTotal'),
    value: formatCurrency(receipt.finalTotal),
    detail: receipt.fixedTotal === null ? t('summary.calculatedTotal') : t('summary.fixedOverride'),
    icon: Truck,
  },
])

function showToast(nextToast) {
  toast.value = nextToast
  window.setTimeout(() => {
    if (toast.value === nextToast) toast.value = null
  }, 3000)
}

function addProduct() {
  receipt.addProduct()
  showToast({ title: t('toast.productAddedTitle'), description: t('toast.productAddedDescription'), type: 'success' })
}

function updateProduct(updatedProduct) {
  receipt.updateProduct(updatedProduct)
}

function removeProduct(productId) {
  if (receipt.products.length === 1) return
  receipt.removeProduct(productId)
  showToast({ title: t('toast.productRemovedTitle'), description: t('toast.productRemovedDescription'), type: 'success' })
}

function resetProducts() {
  receipt.resetDraft()
}

function reorderProducts(payload) {
  receipt.reorderProducts(payload)
}

function getPaperConfig() {
  return {
    widthMm: settings.paperSize.widthMm,
    heightMm: settings.paperSize.heightMm,
    widthPx: settings.receiptWidthPx,
  }
}

async function copyReceiptImage() {
  const productsValid = receipt.validateProducts(t)
  const customerValid = receipt.validateCustomerInfo(t)

  if (!productsValid || !customerValid) {
    showToast({
      title: t('toast.incompleteTitle'),
      description: t('toast.incompleteDescription'),
      type: 'error',
    })
    return
  }

  try {
    await nextTick()
    await copyAsImage(receiptElement.value, settings.selectedTemplate, getPaperConfig())
    showToast({
      title: t('toast.imageCopiedTitle'),
      description: t('toast.imageCopiedDescription'),
      type: 'success',
    })
  } catch {
    showToast({
      title: t('toast.copyFailedTitle'),
      description: t('toast.copyFailedDescription'),
      type: 'error',
    })
  }
}

function duplicateReceipt(entry) {
  receipt.duplicateFrom(entry)
  settings.selectedTemplate = entry.templateType || 'standard'
  isHistoryOpen.value = false
  showToast({
    title: t('toast.duplicatedTitle'),
    description: t('toast.duplicatedDescription'),
    type: 'success',
  })
}

function handleGlobalKeydown(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
    e.preventDefault()
    addProduct()
    return
  }
  if (e.key === 'Escape') {
    if (isPreviewOpen.value) {
      isPreviewOpen.value = false
    } else if (isDialogOpen.value) {
      isDialogOpen.value = false
    } else if (isBusinessInfoOpen.value) {
      isBusinessInfoOpen.value = false
    }
  }
}

onMounted(() => window.addEventListener('keydown', handleGlobalKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleGlobalKeydown))

function continueToCustomerInfo() {
  if (!receipt.validateProducts(t)) {
    showToast({
      title: t('toast.checkProductsTitle'),
      description: t('toast.checkProductsDescription'),
      type: 'error',
    })
    return
  }

  isDialogOpen.value = true
}

function openReceiptPreview() {
  isPreviewOpen.value = true
}

async function createPdf() {
  const productsValid = receipt.validateProducts(t)
  const customerValid = receipt.validateCustomerInfo(t)

  if (!productsValid || !customerValid) {
    showToast({
      title: t('toast.incompleteTitle'),
      description: t('toast.incompleteDescription'),
      type: 'error',
    })
    return
  }

  try {
    await nextTick()
    await generatePdf(receiptElement.value, receipt.receiptNumber, settings.selectedTemplate, getPaperConfig())
    addEntry({
      receiptNumber: receipt.receiptNumber,
      receiptDate: receipt.receiptDate,
      products: receipt.products,
      customerInfo: receipt.customerInfo,
      totals: receipt.totals,
      templateType: settings.selectedTemplate,
    })
    isDialogOpen.value = false
    receipt.refreshReceiptNumber()
    receipt.products = [{ id: crypto.randomUUID(), name: '', quantity: '1', unitPrice: '' }]
    showToast({
      title: t('toast.exportedTitle'),
      description: t('toast.exportedDescription'),
      type: 'success',
    })
  } catch (error) {
    showToast({
      title: t('toast.failedTitle'),
      description: error instanceof Error ? error.message : t('toast.failedDescription'),
      type: 'error',
    })
  }
}

function handleCustomWidth(event) {
  const val = Number(event.target.value)
  if (val > 0) settings.setCustomSize(val, settings.paperSize.heightMm)
}

function handleCustomHeight(event) {
  const val = Number(event.target.value)
  if (val > 0) settings.setCustomSize(settings.paperSize.widthMm, val)
}
</script>

<template>
  <main class="min-h-svh bg-[#f7f7f7] px-4 py-6 text-black dark:bg-[#1c1a17] dark:text-[#f7f7f7] sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-7xl flex-col gap-6">
      <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex items-start gap-4">
          <img :src="appLogo" alt="Receipt PDF Creator" class="h-12 w-12 rounded-lg sm:h-14 sm:w-14" />
          <div>
            <h1 class="text-3xl font-semibold text-[#854836] sm:text-4xl text-shadow">{{ t('app.title') }}</h1>
            <p class="mt-3 max-w-2xl text-sm text-[#6b5a50] dark:text-[#b09080] sm:text-base">
              {{ t('app.description') }}
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" size="icon" :aria-label="t('businessInfo.title')" @click="isBusinessInfoOpen = true">
            <Settings class="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="icon" :aria-label="settings.isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="settings.toggleDark()">
            <Sun v-if="settings.isDark" class="h-4 w-4" aria-hidden="true" />
            <Moon v-else class="h-4 w-4" aria-hidden="true" />
          </Button>
          <AppLanguageSwitcher />
        </div>
      </header>

      <section class="grid gap-4 lg:grid-cols-3">
        <Card v-for="card in summaryCards" :key="card.label" class="p-5">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-[#6b5a50] dark:text-[#b09080]">{{ card.label }}</p>
              <p class="mt-2 text-2xl font-semibold text-black dark:text-[#f7f7f7]">{{ card.value }}</p>
              <p class="mt-1 text-sm text-[#6b5a50] dark:text-[#b09080]">{{ card.detail }}</p>
            </div>
            <div class="flex h-11 w-11 items-center justify-center rounded-md bg-[#fff8ed] text-[#854836] dark:bg-[#2a1f15]">
              <component :is="card.icon" class="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </Card>
      </section>

      <div class="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card class="p-4 sm:p-6">
          <ProductTable
            :products="receipt.products"
            :errors="receipt.productErrors"
            :product-suggestions="productSuggestions"
            @add-product="addProduct"
            @update-product="updateProduct"
            @remove-product="removeProduct"
            @reset-product="resetProducts"
            @reorder-product="reorderProducts"
          />
        </Card>

        <Card class="p-4 sm:p-6">
          <!-- Template selector -->
          <div class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-[#854836]">{{ t('template.label') }}</p>
            <div class="flex gap-1 rounded-lg border border-[#eadfce] bg-[#faf9f7] p-1 dark:border-[#3d2e28] dark:bg-[#1e1b18]">
              <button
                class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                :class="settings.selectedTemplate === 'standard'
                  ? 'bg-[#ffb22c] text-black shadow-sm'
                  : 'text-[#6b5a50] hover:text-black dark:text-[#b09080] dark:hover:text-[#f7f7f7]'"
                @click="settings.selectedTemplate = 'standard'"
              >
                {{ t('template.standard') }}
              </button>
              <button
                class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                :class="settings.selectedTemplate === 'elderly'
                  ? 'bg-[#ffb22c] text-black shadow-sm'
                  : 'text-[#6b5a50] hover:text-black dark:text-[#b09080] dark:hover:text-[#f7f7f7]'"
                @click="settings.selectedTemplate = 'elderly'"
              >
                {{ t('template.elderly') }}
              </button>
            </div>
          </div>

          <!-- Paper size selector -->
          <div class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-[#854836]">{{ t('paperSize.label') }}</p>
            <div class="flex gap-1 rounded-lg border border-[#eadfce] bg-[#faf9f7] p-1 dark:border-[#3d2e28] dark:bg-[#1e1b18]">
              <button
                v-for="size in paperSizeOptions"
                :key="size"
                class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                :class="settings.paperSize.preset === size
                  ? 'bg-[#ffb22c] text-black shadow-sm'
                  : 'text-[#6b5a50] hover:text-black dark:text-[#b09080] dark:hover:text-[#f7f7f7]'"
                @click="size === 'custom' ? settings.setCustomSize(settings.paperSize.widthMm, settings.paperSize.heightMm) : settings.setPaperSize(size)"
              >
                {{ t(`paperSize.${size}`) }}
              </button>
            </div>
            <div v-if="settings.paperSize.preset === 'custom'" class="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-xs font-medium text-[#6b5a50] dark:text-[#b09080]" for="paper-width">{{ t('paperSize.width') }}</label>
                <Input
                  id="paper-width"
                  type="number"
                  inputmode="numeric"
                  :model-value="settings.paperSize.widthMm"
                  @change="handleCustomWidth"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-[#6b5a50] dark:text-[#b09080]" for="paper-height">{{ t('paperSize.height') }}</label>
                <Input
                  id="paper-height"
                  type="number"
                  inputmode="numeric"
                  :model-value="settings.paperSize.heightMm"
                  @change="handleCustomHeight"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-black dark:text-[#f7f7f7]">{{ t('summary.receiptSummary') }}</h2>
              <p class="mt-1 text-sm text-[#6b5a50] dark:text-[#b09080]">{{ receipt.receiptNumber }}</p>
            </div>
            <span class="rounded-md bg-[#fff8ed] px-3 py-1 text-sm font-medium text-[#854836] dark:bg-[#2a1f15]">{{ t('app.draftSaved') }}</span>
          </div>

          <Separator class="my-5" />

          <div class="space-y-3 text-sm">
            <div class="flex justify-between gap-4 text-[#6b5a50] dark:text-[#b09080]">
              <span>{{ t('summary.subtotal') }}</span>
              <span class="font-medium text-black dark:text-[#f7f7f7]">{{ formatCurrency(receipt.subtotal) }}</span>
            </div>
            <div class="flex justify-between gap-4 text-[#6b5a50] dark:text-[#b09080]">
              <span>{{ t('summary.deliveryFee') }}</span>
              <span class="font-medium text-black dark:text-[#f7f7f7]">{{ formatCurrency(receipt.deliveryFee) }}</span>
            </div>
            <div class="flex justify-between gap-4 text-[#6b5a50] dark:text-[#b09080]">
              <span>{{ t('summary.discount') }}</span>
              <span class="font-medium text-black dark:text-[#f7f7f7]">{{ formatCurrency(receipt.discount) }}</span>
            </div>
            <Separator />
            <div class="flex items-center justify-between gap-4 text-lg font-bold text-black dark:text-[#f7f7f7]">
              <span>{{ t('summary.finalTotal') }}</span>
              <span>{{ formatCurrency(receipt.finalTotal) }}</span>
            </div>
          </div>

          <div class="mt-6 rounded-lg border border-[#eadfce] bg-[#faf9f7] p-4 dark:border-[#3d2e28] dark:bg-[#1e1b18]">
            <h3 class="text-sm font-semibold text-black dark:text-[#f7f7f7]">{{ t('summary.previewData') }}</h3>
            <dl class="mt-3 space-y-2 text-sm text-[#6b5a50] dark:text-[#b09080]">
              <div class="flex justify-between gap-4">
                <dt>{{ t('summary.receiptDate') }}</dt>
                <dd class="font-medium text-black dark:text-[#f7f7f7]">{{ receipt.receiptDate }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt>{{ t('summary.products') }}</dt>
                <dd class="font-medium text-black dark:text-[#f7f7f7]">{{ receipt.products.length }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt>{{ t('summary.totalUnits') }}</dt>
                <dd class="font-medium text-black dark:text-[#f7f7f7]">{{ receipt.totalQuantity }}</dd>
              </div>
            </dl>
          </div>

          <div class="mt-6 grid gap-3">
            <Button variant="outline" class="w-full" @click="openReceiptPreview">
              <Eye class="h-4 w-4" aria-hidden="true" />
              {{ t('app.preview') }}
            </Button>
            <Button variant="outline" class="w-full" :disabled="isCopying" @click="copyReceiptImage">
              <Loader2 v-if="isCopying" class="h-4 w-4 animate-spin" aria-hidden="true" />
              <Copy v-else class="h-4 w-4" aria-hidden="true" />
              {{ t('dialog.copyImage') }}
            </Button>
            <Button variant="outline" class="w-full" @click="isHistoryOpen = true">
              <History class="h-4 w-4" aria-hidden="true" />
              {{ t('history.title') }}
            </Button>
            <Button class="w-full" :disabled="isGenerating" @click="continueToCustomerInfo">
              {{ t('app.continue') }}
            </Button>
          </div>
        </Card>
      </div>
    </div>

    <div class="pointer-events-none fixed left-[-10000px] top-0" aria-hidden="true">
      <div ref="receiptElement">
        <ReceiptPreview
          v-if="settings.selectedTemplate === 'standard'"
          :products="receipt.products"
          :customer-info="receipt.customerInfo"
          :totals="receipt.totals"
          :receipt-number="receipt.receiptNumber"
          :receipt-date="receipt.receiptDate"
          :receipt-width="settings.receiptWidthPx"
        />
        <ReceiptPreviewElderly
          v-else
          :products="receipt.products"
          :customer-info="receipt.customerInfo"
          :totals="receipt.totals"
          :receipt-number="receipt.receiptNumber"
          :receipt-date="receipt.receiptDateElderly"
          :receipt-width="settings.receiptWidthPx"
        />
      </div>
    </div>

    <CustomerInfoDialog
      v-model:open="isDialogOpen"
      v-model:customer-info="receipt.customerInfo"
      :errors="receipt.customerErrors"
      :is-generating="isGenerating"
      :is-copying="isCopying"
      :final-total="formatCurrency(receipt.finalTotal)"
      @create-pdf="createPdf"
      @preview="openReceiptPreview"
      @copy-image="copyReceiptImage"
    />

    <BusinessInfoDialog v-model:open="isBusinessInfoOpen" />

    <ReceiptHistoryPanel
      v-model:open="isHistoryOpen"
      :history="history"
      @duplicate="duplicateReceipt"
      @delete="deleteEntry"
    />

    <Teleport to="body">
      <div
        v-if="isPreviewOpen"
        class="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-preview-title"
      >
        <div class="flex max-h-[92svh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#252320]">
          <div class="flex items-start justify-between gap-4 border-b border-[#eadfce] p-5 dark:border-[#3d2e28]">
            <div>
              <h2 id="receipt-preview-title" class="text-lg font-semibold text-black dark:text-[#f7f7f7]">{{ t('app.previewTitle') }}</h2>
              <p class="mt-1 text-sm text-[#6b5a50] dark:text-[#b09080]">{{ t('app.previewDescription') }}</p>
            </div>
            <div class="flex items-center gap-2">
              <KbdBadge keys="Esc" />
              <Button variant="ghost" size="icon" :aria-label="t('app.closePreview')" @click="isPreviewOpen = false">
                <X class="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div class="overflow-auto bg-[#f7f7f7] p-4 dark:bg-[#1c1a17]">
            <div class="mx-auto w-fit origin-top scale-[0.72] sm:scale-90 lg:scale-100">
              <ReceiptPreview
                v-if="settings.selectedTemplate === 'standard'"
                :products="receipt.products"
                :customer-info="receipt.customerInfo"
                :totals="receipt.totals"
                :receipt-number="receipt.receiptNumber"
                :receipt-date="receipt.receiptDate"
                :receipt-width="settings.receiptWidthPx"
              />
              <ReceiptPreviewElderly
                v-else
                :products="receipt.products"
                :customer-info="receipt.customerInfo"
                :totals="receipt.totals"
                :receipt-number="receipt.receiptNumber"
                :receipt-date="receipt.receiptDateElderly"
                :receipt-width="settings.receiptWidthPx"
              />
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Toast :toast="toast" />
  </main>
</template>
