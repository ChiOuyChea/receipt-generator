<script setup>
import { Languages, ChevronDown } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useAppLocale } from '../../composables/useAppLocale'
import DropdownMenu from '../ui/DropdownMenu.vue'

const { t } = useI18n()
const { currentLocale, supportedLocales, setLocale } = useAppLocale()
</script>

<template>
  <DropdownMenu>
    <template #trigger="{ open }">
      <button
        class="flex items-center gap-2 rounded-lg border border-[#eadfce] bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-[#fff8ed] dark:border-[#3d2e28] dark:bg-[#252320] dark:text-[#f7f7f7] dark:hover:bg-[#2d2420]"
        :aria-expanded="open"
        :aria-label="t('language.label')"
      >
        <Languages class="h-4 w-4 text-[#854836]" aria-hidden="true" />
        <span class="font-semibold">{{ supportedLocales.find((l) => l.code === currentLocale)?.label }}</span>
        <ChevronDown
          class="h-3.5 w-3.5 text-[#854836] transition-transform duration-200"
          :class="{ 'rotate-180': open }"
          aria-hidden="true"
        />
      </button>
    </template>
    <template #default="{ close }">
      <button
        v-for="locale in supportedLocales"
        :key="locale.code"
        class="flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-[#fff8ed] dark:hover:bg-[#2d2420]"
        :class="
          locale.code === currentLocale
            ? 'font-semibold text-[#854836]'
            : 'text-black dark:text-[#f7f7f7]'
        "
        @click="setLocale(locale.code); close()"
      >
        {{ locale.label }}
      </button>
    </template>
  </DropdownMenu>
</template>
