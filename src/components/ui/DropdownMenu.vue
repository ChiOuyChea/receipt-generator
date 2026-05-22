<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)
const rootRef = ref(null)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function handleOutsideClick(event) {
  if (rootRef.value && !rootRef.value.contains(event.target)) {
    close()
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div ref="rootRef" class="relative inline-block">
    <div @click="toggle">
      <slot name="trigger" :open="isOpen" />
    </div>
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 mt-1 min-w-[9rem] rounded-lg border border-[#eadfce] bg-white py-1 shadow-xl dark:border-[#3d2e28] dark:bg-[#252320]"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>
