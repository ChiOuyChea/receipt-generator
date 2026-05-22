# Receipt PDF Creator

A professional receipt builder and PDF export tool built with Vue 3. Manage products, confirm delivery details, preview receipt layouts, and export print-ready PDFs.

## Features

- **Product Management** — Add, edit, reorder, and remove products with real-time total calculations
- **Receipt Templates** — Standard and elderly-friendly (larger text) receipt layouts
- **Custom Paper Sizes** — A4, A5, A6, or custom dimensions (mm)
- **Business Info Customization** — Set your own shop name, address, phone number, and logo
- **PDF Export** — Generate multi-page PDFs at the selected paper size
- **Copy as Image** — Copy the receipt to clipboard as a PNG
- **Receipt History** — Browse, duplicate, or delete previously created receipts
- **Draft Auto-Save** — Work-in-progress is persisted to localStorage
- **Dark Mode** — Toggle between light and dark themes
- **Bilingual** — English and Khmer (vue-i18n)

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Pinia** for state management
- **Vite** for build tooling
- **TailwindCSS** for styling
- **jsPDF** + **html2canvas** for PDF/image generation
- **vue-i18n** for internationalization

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
