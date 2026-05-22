import { defineStore } from 'pinia'

const STORAGE_KEY = 'receipt-pdf-creation-settings'

export const PAPER_PRESETS = {
  a4: { widthMm: 210, heightMm: 297 },
  a5: { widthMm: 148, heightMm: 210 },
  a6: { widthMm: 105, heightMm: 148 },
}

const A4_WIDTH_PX = 794

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function applyDark(value) {
  document.documentElement.classList.toggle('dark', value)
}

export const useSettingsStore = defineStore('settings', {
  state: () => {
    const saved = loadSettings()
    const isDark = saved?.isDark ?? localStorage.getItem('receipt-pdf-creation-dark-mode') === 'true'
    applyDark(isDark)

    return {
      selectedTemplate: saved?.selectedTemplate ?? 'standard',
      paperSize: saved?.paperSize ?? { preset: 'a4', widthMm: 210, heightMm: 297 },
      isDark,
    }
  },

  getters: {
    receiptWidthPx: (state) =>
      Math.round((state.paperSize.widthMm / 210) * A4_WIDTH_PX),
  },

  actions: {
    setPaperSize(preset) {
      const dims = PAPER_PRESETS[preset]
      if (dims) {
        this.paperSize = { preset, ...dims }
      }
    },

    setCustomSize(widthMm, heightMm) {
      this.paperSize = {
        preset: 'custom',
        widthMm: Math.max(50, Math.min(500, widthMm)),
        heightMm: Math.max(50, Math.min(500, heightMm)),
      }
    },

    toggleDark() {
      this.isDark = !this.isDark
      applyDark(this.isDark)
    },

    _initPersistence() {
      this.$subscribe(() => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            selectedTemplate: this.selectedTemplate,
            paperSize: this.paperSize,
            isDark: this.isDark,
          }),
        )
      })
    },
  },
})
