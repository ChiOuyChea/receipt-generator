<script setup>
import { Plus, RotateCcw } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import Button from '../ui/Button.vue'
import KbdBadge from '../ui/KbdBadge.vue'
import ProductRow from './ProductRow.vue'

defineProps({
  products: {
    type: Array,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  productSuggestions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['add-product', 'update-product', 'remove-product', 'reorder-product'])
const { t } = useI18n()
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-black dark:text-[#f7f7f7]">{{ t('products.title') }}</h2>
        <p class="mt-1 text-sm text-[#6b5a50] dark:text-[#b09080]">{{ t('products.description') }}</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="emit('reset-product')">
          <RotateCcw class="h-3.5 w-3.5" aria-hidden="true" />
          {{ t('app.resetProducts') }}
        </Button>
        <Button variant="outline" @click="emit('add-product')">
          <Plus class="h-4 w-4" aria-hidden="true" />
          {{ t('products.add') }}
          <KbdBadge keys="Ctrl+Shift+Enter" />
        </Button>
      </div>
    </div>

    <div class="sticky top-0 z-10 hidden grid-cols-[auto_1.5fr_0.7fr_0.8fr_0.8fr_auto] gap-3 border-b border-[#eadfce] bg-white/95 pb-3 pt-2 text-xs font-bold uppercase tracking-wide text-[#854836] backdrop-blur dark:border-[#3d2e28] dark:bg-[#252320]/95 md:grid">
      <span></span>
      <span>{{ t('products.name') }}</span>
      <span>{{ t('products.quantity') }}</span>
      <span>{{ t('products.unitPrice') }}</span>
      <span>{{ t('products.total') }}</span>
      <span class="sr-only">{{ t('products.actions') }}</span>
    </div>

    <div v-if="!products.length" class="rounded-xl border border-dashed border-[#eadfce] bg-[#fff8ed] p-8 text-center text-sm text-[#6b5a50] dark:border-[#3d2e28] dark:bg-[#2a1f15] dark:text-[#b09080]">
      {{ t('products.empty') }}
    </div>

    <TransitionGroup name="row" tag="div" class="space-y-3">
      <ProductRow
        v-for="product in products"
        :key="product.id"
        :product="product"
        :errors="errors[product.id]"
        :can-remove="products.length > 1"
        :product-suggestions="productSuggestions"
        @update-product="emit('update-product', $event)"
        @remove="emit('remove-product', $event)"
        @focus-next="emit('add-product')"
        @reorder="emit('reorder-product', $event)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.row-enter-active,
.row-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.row-enter-from,
.row-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
