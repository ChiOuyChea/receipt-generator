<script setup>
defineProps({
  keys: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <kbd class="hidden rounded border border-[#eadfce] bg-[#faf9f7] px-1.5 py-0.5 text-[10px] font-medium text-[#6b5a50] dark:border-[#3d2e28] dark:bg-[#1e1b18] dark:text-[#b09080] sm:inline-block">
    {{ keys }}
  </kbd>
</template>
