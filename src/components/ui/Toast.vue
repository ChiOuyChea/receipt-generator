<script setup>
import { computed } from 'vue'
import { CheckCircle2, AlertCircle, Info } from 'lucide-vue-next'

const props = defineProps({
  toast: {
    type: Object,
    default: null,
  },
})

const iconComponent = computed(() => {
  if (props.toast?.type === 'success') return CheckCircle2
  if (props.toast?.type === 'error') return AlertCircle
  return Info
})
</script>

<template>
  <Transition name="toast">
    <div
      v-if="toast"
      class="fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-[#eadfce] bg-white p-4 text-left shadow-lg dark:border-[#3d2e28] dark:bg-[#252320]"
      role="status"
      aria-live="polite"
    >
      <component
        :is="iconComponent"
        class="mt-0.5 h-5 w-5"
        :class="toast.type === 'error' ? 'text-rose-600' : 'text-[#854836]'"
        aria-hidden="true"
      />
      <div>
        <p class="text-sm font-semibold text-black dark:text-[#f7f7f7]">{{ toast.title }}</p>
        <p v-if="toast.description" class="mt-1 text-sm text-[#6b5a50] dark:text-[#b09080]">{{ toast.description }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
