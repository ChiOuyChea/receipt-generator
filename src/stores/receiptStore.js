import { defineStore } from 'pinia'
import { toNumber, formatDate, formatDateElderly } from '../lib/utils'

const STORAGE_KEY = 'receipt-pdf-creation-draft'

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

export const useReceiptStore = defineStore('receipt', {
  state: () => {
    const draft = loadDraft()
    return {
      products: draft?.products?.length ? draft.products : [createProduct()],
      customerInfo: {
        customerName: draft?.customerInfo?.customerName ?? '',
        phoneNumber: draft?.customerInfo?.phoneNumber ?? '',
        deliveryAddress: draft?.customerInfo?.deliveryAddress ?? '',
        deliveryFee: draft?.customerInfo?.deliveryFee ?? '0',
        discount: draft?.customerInfo?.discount ?? '0',
        fixedTotalPrice: draft?.customerInfo?.fixedTotalPrice ?? '',
        deliveryService: draft?.customerInfo?.deliveryService ?? 'vireakbutham',
        deliveryServiceCustom: draft?.customerInfo?.deliveryServiceCustom ?? '',
        notes: draft?.customerInfo?.notes ?? '',
      },
      receiptNumber: draft?.receiptNumber ?? createReceiptNumber(),
      receiptDate: formatDate(new Date()),
      receiptDateElderly: formatDateElderly(new Date()),
      productErrors: {},
      customerErrors: {},
    }
  },

  getters: {
    subtotal: (state) =>
      state.products.reduce((sum, p) => sum + toNumber(p.quantity) * toNumber(p.unitPrice), 0),

    totalQuantity: (state) =>
      state.products.reduce((sum, p) => sum + toNumber(p.quantity), 0),

    deliveryFee: (state) =>
      Math.max(0, toNumber(state.customerInfo.deliveryFee)),

    discount: (state) =>
      Math.max(0, toNumber(state.customerInfo.discount)),

    fixedTotal: (state) => {
      const value = toNumber(state.customerInfo.fixedTotalPrice)
      return state.customerInfo.fixedTotalPrice === '' || value < 0 ? null : value
    },

    finalTotal() {
      return this.fixedTotal === null
        ? this.subtotal + this.deliveryFee - this.discount
        : this.fixedTotal
    },

    totals() {
      return {
        subtotal: this.subtotal,
        totalQuantity: this.totalQuantity,
        deliveryFee: this.deliveryFee,
        discount: this.discount,
        fixedTotal: this.fixedTotal,
        finalTotal: this.finalTotal,
      }
    },
  },

  actions: {
    addProduct() {
      this.products.push(createProduct())
    },

    updateProduct(updatedProduct) {
      const idx = this.products.findIndex((p) => p.id === updatedProduct.id)
      if (idx !== -1) this.products[idx] = updatedProduct
    },

    removeProduct(productId) {
      if (this.products.length === 1) return
      this.products = this.products.filter((p) => p.id !== productId)
      delete this.productErrors[productId]
    },

    reorderProducts({ fromId, toId }) {
      const arr = [...this.products]
      const fromIdx = arr.findIndex((p) => p.id === fromId)
      const toIdx = arr.findIndex((p) => p.id === toId)
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return
      const [moved] = arr.splice(fromIdx, 1)
      arr.splice(toIdx, 0, moved)
      this.products = arr
    },

    resetDraft() {
      this.products = [createProduct()]
      this.productErrors = {}
      this.customerInfo = {
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
      this.customerErrors = {}
    },

    refreshReceiptNumber() {
      this.receiptNumber = createReceiptNumber()
    },

    duplicateFrom(entry) {
      this.products = entry.products.map((p) => ({ ...p, id: crypto.randomUUID() }))
      this.customerInfo = {
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
      this.receiptNumber = createReceiptNumber()
    },

    validateProducts(t) {
      this.productErrors = {}

      if (!this.products.length) return false

      this.products.forEach((product) => {
        const errors = {}
        if (!product.name.trim()) errors.name = t('validation.productRequired')
        if (toNumber(product.quantity) <= 0) errors.quantity = t('validation.quantityPositive')
        if (product.unitPrice === '' || toNumber(product.unitPrice) < 0) errors.unitPrice = t('validation.priceValid')
        if (Object.keys(errors).length) this.productErrors[product.id] = errors
      })

      return Object.keys(this.productErrors).length === 0
    },

    validateCustomerInfo(t) {
      this.customerErrors = {}

      if (!this.customerInfo.phoneNumber.trim()) {
        this.customerErrors.phoneNumber = t('validation.phoneRequired')
      }
      if (!this.customerInfo.deliveryAddress.trim()) {
        this.customerErrors.deliveryAddress = t('validation.addressRequired')
      }
      if (this.customerInfo.deliveryFee === '' || toNumber(this.customerInfo.deliveryFee) < 0) {
        this.customerErrors.deliveryFee = t('validation.deliveryFeeValid')
      }
      if (this.customerInfo.discount !== '' && toNumber(this.customerInfo.discount) < 0) {
        this.customerErrors.discount = t('validation.discountValid')
      }
      if (this.customerInfo.fixedTotalPrice !== '' && toNumber(this.customerInfo.fixedTotalPrice) < 0) {
        this.customerErrors.fixedTotalPrice = t('validation.fixedTotalValid')
      }

      return Object.keys(this.customerErrors).length === 0
    },

    _initPersistence() {
      this.$subscribe(() => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            products: this.products,
            customerInfo: this.customerInfo,
            receiptNumber: this.receiptNumber,
          }),
        )
      })
    },
  },
})
