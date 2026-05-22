Implementation Plan: 8 New Features                                                                         
                                                                                                        
Context

The receipt PDF creation app needs 8 new features: copy shareable image, notes field, discount field,
receipt history, drag-to-reorder products, product autocomplete, duplicate receipt, and keyboard shortcut
indicators. These build on the existing Vue 3 + Composition API architecture with localStorage persistence.

Build Order

Features have dependencies — build in this order:

Phase 1 (independent, data model changes):
3. Discount Field
2. Notes / Remarks Field

Phase 2 (independent, no data model deps):
1. Copy Shareable Image
5. Drag to Reorder Products
8. Keyboard Navigation Indicators

Phase 3 (depends on Phase 1 — needs complete data model):
4. Receipt History

Phase 4 (depends on Phase 3 — needs history infrastructure):
7. Duplicate Receipt
6. Product Autocomplete

---
Feature 3: Discount Field

Files to modify:
- src/composables/useReceiptCalculator.js — add discount computed, update finalTotal
- src/components/receipt/ReceiptPage.vue — add discount to customerInfo init + reset, destructure from
calculator, add to totals computed, replace formatCurrency(0) in sidebar
- src/components/receipt/CustomerInfoDialog.vue — add discount input (sanitizeNumber, same pattern as
deliveryFee) in the fee grid
- src/components/receipt/ReceiptPreview.vue — replace formatCurrency(0) with
formatCurrency(totals.discount)
- src/components/receipt/ReceiptPreviewElderly.vue — same replacement
- src/locales/en.json + km.json — dialog.discount, validation.discountValid

Calculator change (useReceiptCalculator.js):
const discount = computed(() => Math.max(0, toNumber(customerInfo.value.discount)))
const finalTotal = computed(() =>
fixedTotal.value === null ? subtotal.value + deliveryFee.value - discount.value : fixedTotal.value
)
// Return discount alongside others

CustomerInfo model: Add discount: draft?.customerInfo?.discount ?? '0'
Validation: Add discount check in validateCustomerInfo() — same pattern as deliveryFee

---
Feature 2: Notes / Remarks Field

Files to modify:
- src/components/receipt/ReceiptPage.vue — add notes to customerInfo init + reset
- src/components/receipt/CustomerInfoDialog.vue — add textarea (same style as deliveryAddress textarea)
- src/components/receipt/ReceiptFooter.vue — add notes prop, display notes || t('pdf.notes')
- src/components/receipt/ReceiptPreview.vue — pass :notes="customerInfo.notes" to ReceiptFooter
- src/components/receipt/ReceiptPreviewElderly.vue — change inline t('pdf.notes') to customerInfo.notes ||
t('pdf.notes')
- src/locales/en.json + km.json — dialog.notes, dialog.notesPlaceholder

CustomerInfo model: Add notes: draft?.customerInfo?.notes ?? ''
No PDF_CAPTURE_CSS changes needed — .pdf-notes and .pde-notes already styled in the capture CSS.

---
Feature 1: Copy Shareable Image

Files to modify:
- src/composables/usePdfGenerator.js — add isCopying ref + copyAsImage(element, template) function
- src/components/receipt/ReceiptPage.vue — add copyReceiptImage(), bind to dialog event, add sidebar button
- src/components/receipt/CustomerInfoDialog.vue — add isCopying prop, copy-image emit, copy button in
footer
- src/locales/en.json + km.json — dialog.copyImage, toast.imageCopied*, toast.copyFailed*

copyAsImage implementation (usePdfGenerator.js):
- Reuse preparePdfClone and same html2canvas options
- Convert canvas to blob: canvas.toBlob(resolve, 'image/png') wrapped in Promise
- Write to clipboard: navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
- Try/catch — show failure toast if Clipboard API unavailable (Firefox)

Button placement: In CustomerInfoDialog footer, 3 buttons: Preview | Copy Image | Create PDF. In sidebar,
add Copy Image button between Preview and Continue.

---
Feature 5: Drag to Reorder Products

Files to modify:
- src/components/receipt/ProductRow.vue — add GripVertical drag handle, draggable="true", drag events
- src/components/receipt/ProductTable.vue — add reorder-product emit, forward from ProductRow, update
header grid
- src/components/receipt/ReceiptPage.vue — add reorderProducts({ fromId, toId }) handler
- src/locales/en.json + km.json — products.dragHandle

ProductRow changes:
- Add GripVertical icon as first column element (hidden on mobile, visible md+)
- Row div: draggable="true", @dragstart, @dragover.prevent, @drop, @dragenter/@dragleave for visual
feedback
- dragstart: e.dataTransfer.setData('text/plain', product.id), effectAllowed = 'move'
- drop: emit reorder with { fromId: getData, toId: product.id }
- Grid: md:grid-cols-[auto_1.5fr_0.7fr_0.8fr_0.8fr_auto] (add drag handle column)

ProductTable header: Add empty column for drag handle alignment.

ReceiptPage handler:
function reorderProducts({ fromId, toId }) {
const arr = [...products.value]
const fromIdx = arr.findIndex(p => p.id === fromId)
const toIdx = arr.findIndex(p => p.id === toId)
if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return
const [moved] = arr.splice(fromIdx, 1)
arr.splice(toIdx, 0, moved)
products.value = arr
}

---
Feature 8: Keyboard Navigation Indicators

Files to create:
- src/components/ui/KbdBadge.vue — <kbd> component with prop keys: String

Files to modify:
- src/components/receipt/ProductTable.vue — add <KbdBadge keys="Ctrl+Shift+Enter" /> next to Add Product
button
- src/components/receipt/CustomerInfoDialog.vue — add <KbdBadge keys="Esc" /> near close button
- src/components/receipt/ReceiptPage.vue — add <KbdBadge keys="Esc" /> near preview modal close

KbdBadge styling: hidden sm:inline-block (mobile-hidden), subtle border + muted text matching existing
theme colors.

---
Feature 4: Receipt History

Files to create:
- src/composables/useReceiptHistory.js — manages receipt-pdf-history localStorage array (max 50 entries)
- src/components/receipt/ReceiptHistoryPanel.vue — Teleport modal listing past receipts

Files to modify:
- src/components/receipt/ReceiptPage.vue — save history entry on PDF success, add History button + panel
toggle
- src/locales/en.json + km.json — history.* keys

History entry schema:
{
id: crypto.randomUUID(),
receiptNumber, receiptDate, products, customerInfo,
totals: { subtotal, totalQuantity, deliveryFee, discount, fixedTotal, finalTotal },
templateType: 'standard' | 'elderly',
createdAt: new Date().toISOString()
}

Composable API:
export function useReceiptHistory() {
return { history, addEntry, getEntry, deleteEntry, getUniqueProductNames }
}

ReceiptHistoryPanel: Scrollable list showing receiptNumber, date, customerName, finalTotal, templateType.
Each entry has View (detail), Duplicate (emit), Delete buttons. Uses History icon from lucide-vue-next for
the toggle button.

Save point: In createPdf() after generatePdf() succeeds, before resetting the form.

---
Feature 7: Duplicate Receipt

Files to modify:
- src/components/receipt/ReceiptPage.vue — add duplicateReceipt(entry) handler

Implementation:
function duplicateReceipt(entry) {
products.value = entry.products.map(p => ({ ...p, id: crypto.randomUUID() }))
customerInfo.value = { ...defaultCustomerInfo, ...entry.customerInfo }
selectedTemplate.value = entry.templateType || 'standard'
receiptNumber.value = createReceiptNumber()
isHistoryOpen.value = false
showToast({ title: t('toast.duplicatedTitle'), ... })
}

Bind @duplicate="duplicateReceipt" on ReceiptHistoryPanel.

---
Feature 6: Product Autocomplete

Files to create:
- src/components/ui/AutocompleteInput.vue — wraps Input with dropdown suggestions

Files to modify:
- src/components/receipt/ProductRow.vue — replace name <Input> with <AutocompleteInput>
- src/components/receipt/ProductTable.vue — accept + pass productSuggestions prop
- src/components/receipt/ReceiptPage.vue — compute suggestions from receiptHistory.getUniqueProductNames()

AutocompleteInput API:
- Props: modelValue, suggestions: String[], invalid, placeholder, id
- Emits: update:modelValue
- Internal: isOpen, filteredSuggestions (computed, case-insensitive filter, max 8), highlightedIndex
- Keyboard: ArrowUp/Down navigate, Enter selects, Escape closes
- onBlur: close after 150ms delay (allow mousedown on suggestions)
- Expose focus() by forwarding to inner Input ref

Data source: useReceiptHistory().getUniqueProductNames() — collects unique trimmed product names from all
history entries, sorted alphabetically.

---
New Files Summary

┌────────────────────────────────────────────────┬─────────┐
│                      File                      │ Feature │
├────────────────────────────────────────────────┼─────────┤
│ src/composables/useReceiptHistory.js           │ 4       │
├────────────────────────────────────────────────┼─────────┤
│ src/components/receipt/ReceiptHistoryPanel.vue │ 4       │
├────────────────────────────────────────────────┼─────────┤
│ src/components/ui/AutocompleteInput.vue        │ 6       │
├────────────────────────────────────────────────┼─────────┤
│ src/components/ui/KbdBadge.vue                 │ 8       │
└────────────────────────────────────────────────┴─────────┘

i18n Keys to Add (both en.json + km.json)

- dialog.discount, dialog.notes, dialog.notesPlaceholder, dialog.copyImage
- validation.discountValid
- toast.imageCopied{Title,Description}, toast.copyFailed{Title,Description},
toast.duplicated{Title,Description}
- history.{title,description,empty,viewDetails,duplicate,delete,close,createdAt}
- products.dragHandle

Verification

After implementation, test end-to-end:
1. Add products, enter discount + notes, create PDF — verify discount deducted from total, notes appear on
receipt
2. Copy Image button — verify PNG is on clipboard (paste in any app)
3. Check receipt history panel — verify the just-created receipt appears
4. Duplicate a receipt from history — verify form is pre-filled with new receipt number
5. Type a previously used product name — verify autocomplete suggestions appear
6. Drag a product row to reorder — verify order persists
7. Hover/check Add Product button — verify Ctrl+Shift+Enter badge visible
8. Press ESC — verify modals close in correct order
9. Switch to elderly template — verify discount + notes render correctly
10. Switch language to Khmer — verify all new text is translated