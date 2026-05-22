<script setup>
import { reactive, watch } from 'vue'
import { RotateCcw, Upload, X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'
import KbdBadge from '../ui/KbdBadge.vue'
import Separator from '../ui/Separator.vue'
import { useBusinessInfoStore } from '../../stores/businessInfoStore'

const open = defineModel('open', {
  type: Boolean,
  default: false,
})

const { t } = useI18n()
const store = useBusinessInfoStore()

const form = reactive({
  shopName: store.shopName,
  shopAddress: store.shopAddress,
  shopPhone: store.shopPhone,
})

watch(open, (value) => {
  if (value) {
    form.shopName = store.shopName
    form.shopAddress = store.shopAddress
    form.shopPhone = store.shopPhone
  }
})

function save() {
  store.updateInfo({
    shopName: form.shopName,
    shopAddress: form.shopAddress,
    shopPhone: form.shopPhone,
  })
  open.value = false
}

async function handleLogoUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  await store.uploadLogo(file)
}

function resetDefaults() {
  store.resetToDefaults()
  form.shopName = ''
  form.shopAddress = ''
  form.shopPhone = ''
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="business-info-title"
    >
      <form
        class="flex max-h-[90svh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#252320]"
        @submit.prevent="save"
      >
        <div class="flex items-start justify-between gap-4 p-6">
          <div>
            <h2 id="business-info-title" class="text-lg font-semibold text-black dark:text-[#f7f7f7]">
              {{ t('businessInfo.title') }}
            </h2>
            <p class="mt-1 text-sm text-[#6b5a50] dark:text-[#b09080]">
              {{ t('businessInfo.description') }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <KbdBadge keys="Esc" />
            <Button variant="ghost" size="icon" :aria-label="t('dialog.close')" @click="open = false">
              <X class="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <Separator />

        <div class="space-y-5 overflow-y-auto p-6">
          <!-- Logo -->
          <div>
            <p class="mb-2 text-sm font-medium text-[#854836]">{{ t('businessInfo.logo') }}</p>
            <div class="flex items-center gap-4">
              <img
                :src="store.effectiveLogoUrl"
                alt="Shop logo"
                class="h-16 w-16 rounded-lg border border-[#eadfce] object-cover dark:border-[#3d2e28]"
              />
              <label
                class="flex cursor-pointer items-center gap-2 rounded-md border border-[#eadfce] px-3 py-2 text-sm font-medium text-[#6b5a50] transition hover:border-[#ffb22c] dark:border-[#3d2e28] dark:text-[#b09080]"
              >
                <Upload class="h-4 w-4" aria-hidden="true" />
                {{ t('businessInfo.uploadLogo') }}
                <input type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
              </label>
            </div>
          </div>

          <!-- Shop Name -->
          <div>
            <label class="mb-1 block text-sm font-medium text-[#854836]" for="biz-shop-name">
              {{ t('businessInfo.shopName') }}
            </label>
            <Input id="biz-shop-name" v-model="form.shopName" :placeholder="t('pdf.shopName')" />
          </div>

          <!-- Shop Address -->
          <div>
            <label class="mb-1 block text-sm font-medium text-[#854836]" for="biz-shop-address">
              {{ t('businessInfo.shopAddress') }}
            </label>
            <Input id="biz-shop-address" v-model="form.shopAddress" :placeholder="t('pdf.shopAddress')" />
          </div>

          <!-- Shop Phone -->
          <div>
            <label class="mb-1 block text-sm font-medium text-[#854836]" for="biz-shop-phone">
              {{ t('businessInfo.shopPhone') }}
            </label>
            <Input id="biz-shop-phone" v-model="form.shopPhone" :placeholder="t('pdf.shopPhone')" />
          </div>
        </div>

        <Separator />

        <div class="flex items-center justify-between gap-3 p-6">
          <Button type="button" variant="outline" @click="resetDefaults">
            <RotateCcw class="h-4 w-4" aria-hidden="true" />
            {{ t('businessInfo.resetDefaults') }}
          </Button>
          <Button type="submit">
            {{ t('businessInfo.save') }}
          </Button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
