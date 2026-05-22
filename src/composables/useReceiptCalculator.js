import { computed } from 'vue'
import { toNumber } from '../lib/utils'

export function useReceiptCalculator(products, customerInfo) {
  const subtotal = computed(() =>
    products.value.reduce((sum, product) => {
      return sum + toNumber(product.quantity) * toNumber(product.unitPrice)
    }, 0),
  )

  const totalQuantity = computed(() =>
    products.value.reduce((sum, product) => sum + toNumber(product.quantity), 0),
  )

  const deliveryFee = computed(() => Math.max(0, toNumber(customerInfo.value.deliveryFee)))

  const fixedTotal = computed(() => {
    const value = toNumber(customerInfo.value.fixedTotalPrice)
    return customerInfo.value.fixedTotalPrice === '' || value < 0 ? null : value
  })

  const finalTotal = computed(() =>
    fixedTotal.value === null ? subtotal.value + deliveryFee.value : fixedTotal.value,
  )

  return {
    subtotal,
    totalQuantity,
    deliveryFee,
    fixedTotal,
    finalTotal,
  }
}
