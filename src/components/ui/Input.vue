<script setup>
import { computed, useTemplateRef } from 'vue'
import { cn } from '../../lib/utils'

const model = defineModel()

const props = defineProps({
  invalid: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: '',
  },
})

const inputClasses = computed(() =>
  cn(
    'h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-black outline-none transition placeholder:text-[#a0856e] focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1e1b18] dark:text-[#f7f7f7] dark:placeholder:text-[#7a6050]',
    props.invalid ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20' : 'border-[#eadfce] focus:border-[#FFB22C] focus:ring-[#fff1d8] dark:border-[#3d2e28] dark:focus:ring-[#2a1f15]',
    props.class,
  ),
)

function focus() {
  inputRef.value?.focus()
}

const inputRef = useTemplateRef('input')

defineExpose({ focus })
</script>

<template>
  <input ref="input" v-model="model" :class="inputClasses" />
</template>
