<script setup>
import { computed } from 'vue'
import { cn } from '../../lib/utils'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
  },
  size: {
    type: String,
    default: 'default',
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: '',
  },
})

const buttonClasses = computed(() =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB22C] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-sm',
    {
      'bg-[#FFB22C] text-black hover:bg-[#f1a320]': props.variant === 'default',
      'border border-[#854836] bg-[#854836] text-white hover:bg-[#6f392b]': props.variant === 'secondary',
      'border border-[#eadfce] bg-white text-black hover:bg-[#fff8ed] dark:border-[#3d2e28] dark:bg-[#252320] dark:text-[#f7f7f7] dark:hover:bg-[#2d2420]': props.variant === 'outline',
      'text-[#854836] hover:bg-[#fff1d8] hover:text-black dark:hover:bg-[#2d2420] dark:hover:text-[#f7f7f7]': props.variant === 'ghost',
      'bg-rose-600 text-white hover:bg-rose-700': props.variant === 'destructive',
    },
    {
      'h-10 px-4 py-2': props.size === 'default',
      'h-9 px-3': props.size === 'sm',
      'h-11 px-8': props.size === 'lg',
      'h-9 w-9 p-0': props.size === 'icon',
    },
    props.class,
  ),
)
</script>

<template>
  <button :type="type" :disabled="disabled" :class="buttonClasses">
    <slot />
  </button>
</template>
