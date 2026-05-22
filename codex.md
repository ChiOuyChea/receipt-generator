# Improve Receipt Generator UI/UX + Localization Support

## Objective
Enhance the existing Vue 3 receipt PDF generator application with:
- Better UI/UX
- Multi-language support
- Persistent export language selection
- Khmer localization
- Improved visual design
- Better user workflow after export

The implementation should remain:
- Clean
- Professional
- Responsive
- Easy to maintain
- Production-ready

---

# Theme & Visual Design Improvements

## Update Application Color Palette

Replace the existing theme with this color palette:

| Purpose | Color |
|---|---|
| Primary Background | `#F7F7F7` |
| Primary Accent | `#FFB22C` |
| Secondary Accent | `#854836` |
| Text / Dark Elements | `#000000` |

---

# UI Styling Guidelines

## General Design Direction
The app should feel:
- Warm
- Minimal
- Modern
- Elegant
- Professional

Inspired by:
- Modern POS systems
- Cafe receipt systems
- Minimal ecommerce admin dashboards

---

# Tailwind Theme Configuration

Update Tailwind/Shadcn theme variables to use:

```css
--background: #F7F7F7;
--primary: #FFB22C;
--secondary: #854836;
--foreground: #000000;
````

---

# UI Improvements

## Improve Overall Layout

* Add more spacing between sections
* Use softer shadows
* Add rounded corners consistently
* Improve typography hierarchy
* Improve button visual feedback
* Improve empty state design

---

# Product Table Improvements

## Improve Table UX

* Sticky table header (desktop)
* Better spacing inside cells
* Highlight total row
* Animate row add/remove transitions
* Better mobile stacking layout

---

# Button Improvements

## Primary Buttons

Use:

* Primary accent color `#FFB22C`
* Dark text for readability

## Secondary Buttons

Use:

* Brown accent `#854836`
* White text

## Hover States

Buttons should:

* Slightly scale
* Smooth transition
* Add subtle shadow

---

# Modal Improvements

Improve customer information dialog:

* Better section spacing
* Sticky footer actions
* Responsive mobile behavior
* Smooth open/close animations

---

# Localization / Multi-language Support

## Objective

Support multilingual UI and PDF export.

---

# Required Languages

## Initial Languages

Support:

* English
* Khmer

Structure implementation so future languages can easily be added.

---

# Add Global Language Switcher

## Requirements

Add a language switcher component in app header/navbar.

Users should be able to:

* Switch app language instantly
* Persist selected language
* Use same language for PDF export automatically

---

# Important UX Requirement

## DO NOT ask language during export

The export process should:

* Automatically use currently selected app language
* Avoid asking language every export

The selected language should remain persistent until user changes it manually.

---

# Persistence Requirements

Store selected language in:

* localStorage

On app load:

* Restore previous selected language automatically

---

# Localization Architecture

## Recommended Library

Use:

* `vue-i18n`

---

# Translation File Structure

```bash
src/locales/
├── en.json
├── km.json
```

---

# Translation Requirements

All visible UI text must be localized including:

## General UI

* Buttons
* Labels
* Placeholders
* Table headers
* Validation messages
* Toast messages
* Modal titles
* Empty states

---

# PDF Localization

The generated PDF must also use the selected language.

This includes:

* Receipt title
* Table headers
* Summary labels
* Footer text
* Customer information labels

---

# Khmer Translation Requirements

Add Khmer translations for:

* Entire app UI
* Receipt PDF labels
* Validation messages

---

# Khmer Font Support

## IMPORTANT

PDF export must properly support Khmer Unicode rendering.

Recommended fonts:

* Noto Sans Khmer
* Battambang
* Hanuman

---

# PDF Font Requirements

Ensure:

* Khmer text renders correctly
* No broken Unicode characters
* Proper font embedding if necessary

If using jsPDF:

* Embed Khmer-compatible font
* Avoid default fonts

---

# Language Switcher UX

## Requirements

The language switcher should:

* Be visually clean
* Use dropdown/select menu
* Display language names in native language

Example:

| Language | Label   |
| -------- | ------- |
| English  | English |
| Khmer    | ខ្មែរ   |

---

# Reset Form After Export

## Requirements

After successful PDF export:

### Reset:

* Product list
* Customer information
* Delivery information
* Fixed total
* Validation state

### Do NOT reset:

* Selected language
* Shop configuration
* Theme settings

---

# Reset UX

After export:

* Show success toast
* Reset form smoothly
* Automatically scroll to top
* Focus first product input

---

# Receipt PDF UI Improvements

## Improve Receipt Styling

### Add:

* Better spacing
* Cleaner typography
* Improved summary section
* Better visual hierarchy
* Softer borders/dividers

---

# Receipt Header Improvements

Include:

* Better logo alignment
* Improved receipt metadata layout
* Cleaner date formatting
* Localized labels

---

# Receipt Summary Improvements

Highlight:

* Final total
* Delivery fee
* Important amounts

Use:

* Accent color sparingly
* Better alignment

---

# Responsive Improvements

## Mobile UX

Improve:

* Product table stacking
* Modal scrolling
* Button sizing
* Input spacing
* Receipt preview scaling

---

# State Management Improvements

## Maintain State For:

* Current language
* Receipt form
* Customer information
* PDF generation loading state

---

# Suggested Composables

## useI18n.ts

Handle:

* Current locale
* Change locale
* Persist locale

---

## useReceiptReset.ts

Handle:

* Reset form state
* Preserve settings

---

# Suggested Components

## AppLanguageSwitcher.vue

Global language switcher component

---

## ReceiptPreview.vue

Update to fully support localization

---

# Toast Messages

Localized toast examples:

## English

* "Receipt exported successfully"
* "Product removed"
* "Please complete required fields"

## Khmer

* "វិក្កយបត្រត្រូវបានទាញយកដោយជោគជ័យ"
* "បានលុបផលិតផល"
* "សូមបំពេញព័ត៌មានដែលត្រូវការ"

---

# Accessibility Requirements

Ensure localization implementation:

* Works with screen readers
* Supports keyboard navigation
* Maintains accessibility labels

---

# Performance Requirements

* Lazy load locale files if possible
* Avoid unnecessary re-renders on language switch
* Keep PDF generation optimized

---

# Final Goal

The final application should feel like a polished real-world multilingual receipt generator with:

* Excellent UI/UX
* Smooth interactions
* Professional PDF output
* Proper Khmer language support
* Persistent localization preferences
* Modern responsive design
