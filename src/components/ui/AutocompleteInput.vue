<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import Input from './Input.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  suggestions: {
    type: Array,
    default: () => [],
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits(['update:modelValue'])
const inputRef = useTemplateRef('inputRef')
const isOpen = ref(false)
const highlightedIndex = ref(-1)

const filteredSuggestions = computed(() => {
  const query = props.modelValue?.toLowerCase().trim()
  if (!query || !props.suggestions.length) return []
  return props.suggestions
    .filter((s) => s.toLowerCase().includes(query) && s.toLowerCase() !== query)
    .slice(0, 8)
})

function onInput(value) {
  emit('update:modelValue', value)
  isOpen.value = true
  highlightedIndex.value = -1
}

function selectSuggestion(suggestion) {
  emit('update:modelValue', suggestion)
  isOpen.value = false
  highlightedIndex.value = -1
}

function onKeydown(e) {
  if (!isOpen.value || !filteredSuggestions.value.length) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = (highlightedIndex.value + 1) % filteredSuggestions.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = highlightedIndex.value <= 0
      ? filteredSuggestions.value.length - 1
      : highlightedIndex.value - 1
  } else if (e.key === 'Enter' && highlightedIndex.value >= 0) {
    e.preventDefault()
    selectSuggestion(filteredSuggestions.value[highlightedIndex.value])
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

function onBlur() {
  window.setTimeout(() => {
    isOpen.value = false
  }, 150)
}

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="relative">
    <Input
      :id="id"
      ref="inputRef"
      :model-value="modelValue"
      :invalid="invalid"
      :placeholder="placeholder"
      @update:model-value="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
      @focus="isOpen = true"
    />
    <div
      v-if="isOpen && filteredSuggestions.length"
      class="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-md border border-[#eadfce] bg-white shadow-lg dark:border-[#3d2e28] dark:bg-[#252320]"
    >
      <button
        v-for="(suggestion, index) in filteredSuggestions"
        :key="suggestion"
        type="button"
        class="block w-full px-3 py-2 text-left text-sm text-black transition-colors dark:text-[#f7f7f7]"
        :class="index === highlightedIndex ? 'bg-[#fff8ed] dark:bg-[#2a1f15]' : 'hover:bg-[#faf9f7] dark:hover:bg-[#1e1b18]'"
        @mousedown.prevent="selectSuggestion(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>
