import { defineStore } from 'pinia'
import defaultLogo from '@/assets/r1.jpg'

const STORAGE_KEY = 'receipt-pdf-creation-business-info'

function loadBusinessInfo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useBusinessInfoStore = defineStore('businessInfo', {
  state: () => {
    const saved = loadBusinessInfo()
    return {
      shopName: saved?.shopName ?? '',
      shopAddress: saved?.shopAddress ?? '',
      shopPhone: saved?.shopPhone ?? '',
      logoDataUrl: saved?.logoDataUrl ?? null,
    }
  },

  getters: {
    effectiveLogoUrl: (state) => state.logoDataUrl || defaultLogo,
  },

  actions: {
    updateInfo(partial) {
      if ('shopName' in partial) this.shopName = partial.shopName
      if ('shopAddress' in partial) this.shopAddress = partial.shopAddress
      if ('shopPhone' in partial) this.shopPhone = partial.shopPhone
    },

    async uploadLogo(file) {
      const MAX_SIZE = 200
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const img = new Image()
      img.src = dataUrl
      await new Promise((resolve) => { img.onload = resolve })

      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      this.logoDataUrl = canvas.toDataURL('image/jpeg', 0.85)
    },

    resetToDefaults() {
      this.shopName = ''
      this.shopAddress = ''
      this.shopPhone = ''
      this.logoDataUrl = null
    },

    _initPersistence() {
      this.$subscribe(() => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            shopName: this.shopName,
            shopAddress: this.shopAddress,
            shopPhone: this.shopPhone,
            logoDataUrl: this.logoDataUrl,
          }),
        )
      })
    },
  },
})
