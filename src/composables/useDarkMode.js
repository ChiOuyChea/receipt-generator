import { ref, watch } from 'vue'

const DARK_MODE_KEY = 'receipt-pdf-creation-dark-mode'

const isDark = ref(localStorage.getItem(DARK_MODE_KEY) === 'true')

function applyDark(value) {
  document.documentElement.classList.toggle('dark', value)
}

applyDark(isDark.value)

watch(isDark, (value) => {
  localStorage.setItem(DARK_MODE_KEY, String(value))
  applyDark(value)
})

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
