import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { LOCALE_STORAGE_KEY, supportedLocales } from '../i18n'

export function useAppLocale() {
  const { locale } = useI18n()

  const currentLocale = computed(() => locale.value)

  function setLocale(nextLocale) {
    if (!supportedLocales.some((item) => item.code === nextLocale)) return
    locale.value = nextLocale
  }

  watch(
    locale,
    (value) => {
      localStorage.setItem(LOCALE_STORAGE_KEY, value)
      document.documentElement.lang = value
    },
    { immediate: true },
  )

  return {
    currentLocale,
    supportedLocales,
    setLocale,
  }
}
