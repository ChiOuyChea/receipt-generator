<script setup>
import { computed, ref } from 'vue'
import { GripVertical, Trash2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'
import AutocompleteInput from '../ui/AutocompleteInput.vue'
import { formatCurrency, toNumber } from '../../lib/utils'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  canRemove: {
    type: Boolean,
    default: true,
  },
  productSuggestions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update-product', 'remove', 'focus-next', 'reorder'])
const isDragOver = ref(false)
const { t } = useI18n()

const rowTotal = computed(() =>
  formatCurrency(toNumber(props.product.quantity) * toNumber(props.product.unitPrice)),
)

function updateField(field, value) {
  emit('update-product', {
    ...props.product,
    [field]: value,
  })
}

function sanitizeNumberInput(field, event) {
  const value = event.target.value.replace(/[^\d.]/g, '')
  const parts = value.split('.')
  const normalized = parts.length > 2 ? `${parts.shift()}.${parts.join('')}` : value
  updateField(field, normalized)
}

function onDragStart(e) {
  e.dataTransfer.setData('text/plain', props.product.id)
  e.dataTransfer.effectAllowed = 'move'
}

function onDrop(e) {
  isDragOver.value = false
  const fromId = e.dataTransfer.getData('text/plain')
  if (fromId && fromId !== props.product.id) {
    emit('reorder', { fromId, toId: props.product.id })
  }
}

function onDragEnter() {
  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}
</script>

<template>
  <div
    class="grid gap-3 rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm dark:bg-[#1e1b18] md:grid-cols-[auto_1.5fr_0.7fr_0.8fr_0.8fr_auto] md:items-start md:border-0 md:bg-transparent md:p-0 md:hover:shadow-none dark:md:bg-transparent"
    :class="isDragOver ? 'border-[#FFB22C] bg-[#fff8ed] dark:border-[#FFB22C] dark:bg-[#2a1f15]' : 'border-[#eadfce] dark:border-[#3d2e28]'"
    draggable="true"
    @dragstart="onDragStart"
    @dragover.prevent
    @drop="onDrop"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
  >
    <div class="hidden cursor-grab items-center text-[#a0856e] active:cursor-grabbing md:flex" :aria-label="t('products.dragHandle')">
      <GripVertical class="h-4 w-4" aria-hidden="true" />
    </div>

    <div>
      <label class="mb-1 block text-xs font-medium text-[#854836] md:sr-only" :for="`name-${product.id}`">
        {{ t('products.nameShort') }}
      </label>
      <AutocompleteInput
        :id="`name-${product.id}`"
        :model-value="product.name"
        :invalid="Boolean(errors.name)"
        :placeholder="t('products.nameShort')"
        :suggestions="productSuggestions"
        @update:model-value="updateField('name', $event)"
        @keydown.enter.prevent="emit('focus-next')"
      />
      <p v-if="errors.name" class="mt-1 text-xs text-rose-600">{{ errors.name }}</p>
    </div>

    <div>
      <label class="mb-1 block text-xs font-medium text-[#854836] md:sr-only" :for="`quantity-${product.id}`">
        {{ t('products.quantity') }}
      </label>
      <Input
        :id="`quantity-${product.id}`"
        inputmode="decimal"
        min="0"
        :model-value="product.quantity"
        :invalid="Boolean(errors.quantity)"
        placeholder="1"
        @input="sanitizeNumberInput('quantity', $event)"
        @keydown.enter.prevent="emit('focus-next')"
      />
      <p v-if="errors.quantity" class="mt-1 text-xs text-rose-600">{{ errors.quantity }}</p>
    </div>

    <div>
      <label class="mb-1 block text-xs font-medium text-[#854836] md:sr-only" :for="`price-${product.id}`">
        {{ t('products.unitPrice') }}
      </label>
      <Input
        :id="`price-${product.id}`"
        inputmode="decimal"
        min="0"
        :model-value="product.unitPrice"
        :invalid="Boolean(errors.unitPrice)"
        placeholder="0.00"
        @input="sanitizeNumberInput('unitPrice', $event)"
        @keydown.enter.prevent="emit('focus-next')"
      />
      <p v-if="errors.unitPrice" class="mt-1 text-xs text-rose-600">{{ errors.unitPrice }}</p>
    </div>

    <div>
      <span class="mb-1 block text-xs font-medium text-[#854836] md:sr-only">{{ t('products.rowTotal') }}</span>
      <div class="flex h-10 items-center rounded-md border border-[#eadfce] bg-[#fff8ed] px-3 text-sm font-bold text-black dark:border-[#3d2e28] dark:bg-[#2a1f15] dark:text-[#f7f7f7]">
        {{ rowTotal }}
      </div>
    </div>

    <Button
      variant="ghost"
      size="icon"
      class="justify-self-end text-[#854836] hover:text-rose-600 cursor-pointer"
      :disabled="!canRemove"
      :aria-label="t('products.remove', { name: product.name || t('products.fallbackName') })"
      @click="emit('remove', product.id)"
    >
      <Trash2 class="h-4 w-4" aria-hidden="true" />
    </Button>
  </div>
</template>
