import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import km from './locales/km.json'

export const LOCALE_STORAGE_KEY = 'receipt-pdf-creation-locale'
export const supportedLocales = [
  { code: 'en', label: 'English' },
  { code: 'km', label: 'ខ្មែរ' },
]

function getInitialLocale() {
  const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY)
  return supportedLocales.some((locale) => locale.code === storedLocale) ? storedLocale : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    km,
  },
})
