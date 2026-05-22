<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { Copy, Eye, FileDown, History, Loader2, Moon, PackageCheck, ReceiptText, Sun, Truck, X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import Button from '../ui/Button.vue'
import Card from '../ui/Card.vue'
import Separator from '../ui/Separator.vue'
import Toast from '../ui/Toast.vue'
import KbdBadge from '../ui/KbdBadge.vue'
import AppLanguageSwitcher from './AppLanguageSwitcher.vue'
import ProductTable from './ProductTable.vue'
import CustomerInfoDialog from './CustomerInfoDialog.vue'
import ReceiptPreview from './ReceiptPreview.vue'
import ReceiptPreviewElderly from './ReceiptPreviewElderly.vue'
import ReceiptHistoryPanel from './ReceiptHistoryPanel.vue'
import { useReceiptCalculator } from '../../composables/useReceiptCalculator'
import { usePdfGenerator } from '../../composables/usePdfGenerator'
import { useReceiptHistory } from '../../composables/useReceiptHistory'
import { useDarkMode } from '../../composables/useDarkMode'
import { formatCurrency, formatDate, formatDateElderly, toNumber } from '../../lib/utils'

const STORAGE_KEY = 'receipt-pdf-creation-draft'
const { t } = useI18n()

function createProduct(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: '',
    quantity: '1',
    unitPrice: '',
    ...overrides,
  }
}

function createReceiptNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `ChiOuy-${datePart}`
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const draft = loadDraft()
const products = ref(draft?.products?.length ? draft.products : [createProduct()])
const customerInfo = ref({
  customerName: draft?.customerInfo?.customerName ?? '',
  phoneNumber: draft?.customerInfo?.phoneNumber ?? '',
  deliveryAddress: draft?.customerInfo?.deliveryAddress ?? '',
  deliveryFee: draft?.customerInfo?.deliveryFee ?? '0',
  discount: draft?.customerInfo?.discount ?? '0',
  fixedTotalPrice: draft?.customerInfo?.fixedTotalPrice ?? '',
  deliveryService: draft?.customerInfo?.deliveryService ?? 'vireakbutham',
  deliveryServiceCustom: draft?.customerInfo?.deliveryServiceCustom ?? '',
  notes: draft?.customerInfo?.notes ?? '',
})
const receiptNumber = shallowRef(draft?.receiptNumber ?? createReceiptNumber())
const receiptDate = shallowRef(formatDate(new Date()))
const receiptDateElderly = shallowRef(formatDateElderly(new Date()))
const selectedTemplate = shallowRef('standard')
const isDialogOpen = shallowRef(false)
const isPreviewOpen = shallowRef(false)
const productErrors = reactive({})
const customerErrors = reactive({})
const toast = shallowRef(null)
const receiptElement = useTemplateRef('receiptElement')

const { subtotal, totalQuantity, deliveryFee, discount, fixedTotal, finalTotal } = useReceiptCalculator(
  products,
  customerInfo,
)
const { isGenerating, isCopying, generatePdf, copyAsImage } = usePdfGenerator()
const { isDark, toggle: toggleDark } = useDarkMode()
const { history, addEntry, deleteEntry, getUniqueProductNames } = useReceiptHistory()
const isHistoryOpen = shallowRef(false)
const productSuggestions = computed(() => getUniqueProductNames())

const totals = computed(() => ({
  subtotal: subtotal.value,
  totalQuantity: totalQuantity.value,
  deliveryFee: deliveryFee.value,
  discount: discount.value,
  fixedTotal: fixedTotal.value,
  finalTotal: finalTotal.value,
}))

const summaryCards = computed(() => [
  {
    label: t('summary.products'),
    value: products.value.length,
    detail: t('summary.units', { count: totalQuantity.value }),
    icon: PackageCheck,
  },
  {
    label: t('summary.subtotal'),
    value: formatCurrency(subtotal.value),
    detail: t('summary.beforeDelivery'),
    icon: ReceiptText,
  },
  {
    label: t('summary.finalTotal'),
    value: formatCurrency(finalTotal.value),
    detail: fixedTotal.value === null ? t('summary.calculatedTotal') : t('summary.fixedOverride'),
    icon: Truck,
  },
])

watch(
  [products, customerInfo, receiptNumber],
  () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        products: products.value,
        customerInfo: customerInfo.value,
        receiptNumber: receiptNumber.value,
      }),
    )
  },
  { deep: true },
)

function showToast(nextToast) {
  toast.value = nextToast
  window.setTimeout(() => {
    if (toast.value === nextToast) toast.value = null
  }, 3000)
}

function addProduct() {
  products.value = [...products.value, createProduct()]
  showToast({ title: t('toast.productAddedTitle'), description: t('toast.productAddedDescription'), type: 'success' })
}

function updateProduct(updatedProduct) {
  products.value = products.value.map((product) =>
    product.id === updatedProduct.id ? updatedProduct : product,
  )
}

function removeProduct(productId) {
  if (products.value.length === 1) return
  products.value = products.value.filter((product) => product.id !== productId)
  delete productErrors[productId]
  showToast({ title: t('toast.productRemovedTitle'), description: t('toast.productRemovedDescription'), type: 'success' })
}

function clearErrors(target) {
  Object.keys(target).forEach((key) => {
    delete target[key]
  })
}

function validateProducts() {
  clearErrors(productErrors)

  if (!products.value.length) {
    showToast({ title: t('toast.addProductFirstTitle'), description: t('validation.productListRequired'), type: 'error' })
    return false
  }

  products.value.forEach((product) => {
    const errors = {}

    if (!product.name.trim()) {
      errors.name = t('validation.productRequired')
    }

    if (toNumber(product.quantity) <= 0) {
      errors.quantity = t('validation.quantityPositive')
    }

    if (product.unitPrice === '' || toNumber(product.unitPrice) < 0) {
      errors.unitPrice = t('validation.priceValid')
    }

    if (Object.keys(errors).length) {
      productErrors[product.id] = errors
    }
  })

  return Object.keys(productErrors).length === 0
}

function validateCustomerInfo() {
  clearErrors(customerErrors)

  if (!customerInfo.value.phoneNumber.trim()) {
    customerErrors.phoneNumber = t('validation.phoneRequired')
  }

  if (!customerInfo.value.deliveryAddress.trim()) {
    customerErrors.deliveryAddress = t('validation.addressRequired')
  }

  if (customerInfo.value.deliveryFee === '' || toNumber(customerInfo.value.deliveryFee) < 0) {
    customerErrors.deliveryFee = t('validation.deliveryFeeValid')
  }

  if (customerInfo.value.discount !== '' && toNumber(customerInfo.value.discount) < 0) {
    customerErrors.discount = t('validation.discountValid')
  }

  if (customerInfo.value.fixedTotalPrice !== '' && toNumber(customerInfo.value.fixedTotalPrice) < 0) {
    customerErrors.fixedTotalPrice = t('validation.fixedTotalValid')
  }

  return Object.keys(customerErrors).length === 0
}

function resetProducts() {
  products.value = [createProduct()]
  clearErrors(productErrors)
  customerInfo.value = {
    customerName: '',
    phoneNumber: '',
    deliveryAddress: '',
    deliveryFee: '0',
    discount: '0',
    fixedTotalPrice: '',
    deliveryService: 'vireakbutham',
    deliveryServiceCustom: '',
    notes: '',
  }
  clearErrors(customerErrors)
}

function reorderProducts({ fromId, toId }) {
  const arr = [...products.value]
  const fromIdx = arr.findIndex(p => p.id === fromId)
  const toIdx = arr.findIndex(p => p.id === toId)
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return
  const [moved] = arr.splice(fromIdx, 1)
  arr.splice(toIdx, 0, moved)
  products.value = arr
}

async function copyReceiptImage() {
  const productsValid = validateProducts()
  const customerValid = validateCustomerInfo()

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
    await copyAsImage(receiptElement.value, selectedTemplate.value)
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
  products.value = entry.products.map(p => ({ ...p, id: crypto.randomUUID() }))
  customerInfo.value = {
    customerName: entry.customerInfo?.customerName ?? '',
    phoneNumber: entry.customerInfo?.phoneNumber ?? '',
    deliveryAddress: entry.customerInfo?.deliveryAddress ?? '',
    deliveryFee: entry.customerInfo?.deliveryFee ?? '0',
    discount: entry.customerInfo?.discount ?? '0',
    fixedTotalPrice: entry.customerInfo?.fixedTotalPrice ?? '',
    deliveryService: entry.customerInfo?.deliveryService ?? 'vireakbutham',
    deliveryServiceCustom: entry.customerInfo?.deliveryServiceCustom ?? '',
    notes: entry.customerInfo?.notes ?? '',
  }
  selectedTemplate.value = entry.templateType || 'standard'
  receiptNumber.value = createReceiptNumber()
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
    }
  }
}

onMounted(() => window.addEventListener('keydown', handleGlobalKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleGlobalKeydown))

function continueToCustomerInfo() {
  if (!validateProducts()) {
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
  const productsValid = validateProducts()
  const customerValid = validateCustomerInfo()

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
    await generatePdf(receiptElement.value, receiptNumber.value, selectedTemplate.value)
    addEntry({
      receiptNumber: receiptNumber.value,
      receiptDate: receiptDate.value,
      products: products.value,
      customerInfo: customerInfo.value,
      totals: {
        subtotal: subtotal.value,
        totalQuantity: totalQuantity.value,
        deliveryFee: deliveryFee.value,
        discount: discount.value,
        fixedTotal: fixedTotal.value,
        finalTotal: finalTotal.value,
      },
      templateType: selectedTemplate.value,
    })
    isDialogOpen.value = false
    receiptNumber.value = createReceiptNumber()
    products.value = [createProduct()]
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
</script>

<template>
  <main class="min-h-svh bg-[#f7f7f7] px-4 py-6 text-black dark:bg-[#1c1a17] dark:text-[#f7f7f7] sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-7xl flex-col gap-6">
      <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-[#854836]">{{ t('app.eyebrow') }}</p>
          <h1 class="mt-2 text-3xl font-semibold text-black dark:text-[#f7f7f7] sm:text-4xl">{{ t('app.title') }}</h1>
          <p class="mt-3 max-w-2xl text-sm text-[#6b5a50] dark:text-[#b09080] sm:text-base">
            {{ t('app.description') }}
          </p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" size="icon" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleDark">
            <Sun v-if="isDark" class="h-4 w-4" aria-hidden="true" />
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
            :products="products"
            :errors="productErrors"
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
                :class="selectedTemplate === 'standard'
                  ? 'bg-[#ffb22c] text-black shadow-sm'
                  : 'text-[#6b5a50] hover:text-black dark:text-[#b09080] dark:hover:text-[#f7f7f7]'"
                @click="selectedTemplate = 'standard'"
              >
                {{ t('template.standard') }}
              </button>
              <button
                class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                :class="selectedTemplate === 'elderly'
                  ? 'bg-[#ffb22c] text-black shadow-sm'
                  : 'text-[#6b5a50] hover:text-black dark:text-[#b09080] dark:hover:text-[#f7f7f7]'"
                @click="selectedTemplate = 'elderly'"
              >
                {{ t('template.elderly') }}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-black dark:text-[#f7f7f7]">{{ t('summary.receiptSummary') }}</h2>
              <p class="mt-1 text-sm text-[#6b5a50] dark:text-[#b09080]">{{ receiptNumber }}</p>
            </div>
            <span class="rounded-md bg-[#fff8ed] px-3 py-1 text-sm font-medium text-[#854836] dark:bg-[#2a1f15]">{{ t('app.draftSaved') }}</span>
          </div>

          <Separator class="my-5" />

          <div class="space-y-3 text-sm">
            <div class="flex justify-between gap-4 text-[#6b5a50] dark:text-[#b09080]">
              <span>{{ t('summary.subtotal') }}</span>
              <span class="font-medium text-black dark:text-[#f7f7f7]">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between gap-4 text-[#6b5a50] dark:text-[#b09080]">
              <span>{{ t('summary.deliveryFee') }}</span>
              <span class="font-medium text-black dark:text-[#f7f7f7]">{{ formatCurrency(deliveryFee) }}</span>
            </div>
            <div class="flex justify-between gap-4 text-[#6b5a50] dark:text-[#b09080]">
              <span>{{ t('summary.discount') }}</span>
              <span class="font-medium text-black dark:text-[#f7f7f7]">{{ formatCurrency(discount) }}</span>
            </div>
            <Separator />
            <div class="flex items-center justify-between gap-4 text-lg font-bold text-black dark:text-[#f7f7f7]">
              <span>{{ t('summary.finalTotal') }}</span>
              <span>{{ formatCurrency(finalTotal) }}</span>
            </div>
          </div>

          <div class="mt-6 rounded-lg border border-[#eadfce] bg-[#faf9f7] p-4 dark:border-[#3d2e28] dark:bg-[#1e1b18]">
            <h3 class="text-sm font-semibold text-black dark:text-[#f7f7f7]">{{ t('summary.previewData') }}</h3>
            <dl class="mt-3 space-y-2 text-sm text-[#6b5a50] dark:text-[#b09080]">
              <div class="flex justify-between gap-4">
                <dt>{{ t('summary.receiptDate') }}</dt>
                <dd class="font-medium text-black dark:text-[#f7f7f7]">{{ receiptDate }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt>{{ t('summary.products') }}</dt>
                <dd class="font-medium text-black dark:text-[#f7f7f7]">{{ products.length }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt>{{ t('summary.totalUnits') }}</dt>
                <dd class="font-medium text-black dark:text-[#f7f7f7]">{{ totalQuantity }}</dd>
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
          v-if="selectedTemplate === 'standard'"
          :products="products"
          :customer-info="customerInfo"
          :totals="totals"
          :receipt-number="receiptNumber"
          :receipt-date="receiptDate"
        />
        <ReceiptPreviewElderly
          v-else
          :products="products"
          :customer-info="customerInfo"
          :totals="totals"
          :receipt-number="receiptNumber"
          :receipt-date="receiptDateElderly"
        />
      </div>
    </div>

    <CustomerInfoDialog
      v-model:open="isDialogOpen"
      v-model:customer-info="customerInfo"
      :errors="customerErrors"
      :is-generating="isGenerating"
      :is-copying="isCopying"
      :final-total="formatCurrency(finalTotal)"
      @create-pdf="createPdf"
      @preview="openReceiptPreview"
      @copy-image="copyReceiptImage"
    />

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
                v-if="selectedTemplate === 'standard'"
                :products="products"
                :customer-info="customerInfo"
                :totals="totals"
                :receipt-number="receiptNumber"
                :receipt-date="receiptDate"
              />
              <ReceiptPreviewElderly
                v-else
                :products="products"
                :customer-info="customerInfo"
                :totals="totals"
                :receipt-number="receiptNumber"
                :receipt-date="receiptDateElderly"
              />
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Toast :toast="toast" />
  </main>
</template>
