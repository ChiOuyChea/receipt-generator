import { ref } from 'vue'

const HISTORY_KEY = 'receipt-pdf-history'
const MAX_ENTRIES = 50

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(entries) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
}

const history = ref(loadHistory())

export function useReceiptHistory() {
  function addEntry(data) {
    const entry = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    }
    history.value = [entry, ...history.value].slice(0, MAX_ENTRIES)
    saveHistory(history.value)
  }

  function getEntry(id) {
    return history.value.find((e) => e.id === id)
  }

  function deleteEntry(id) {
    history.value = history.value.filter((e) => e.id !== id)
    saveHistory(history.value)
  }

  function getUniqueProductNames() {
    const names = new Set()
    for (const entry of history.value) {
      if (entry.products) {
        for (const product of entry.products) {
          const name = product.name?.trim()
          if (name) names.add(name)
        }
      }
    }
    return [...names].sort()
  }

  return { history, addEntry, getEntry, deleteEntry, getUniqueProductNames }
}
