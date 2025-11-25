# Future Features - Retribusi Report

<!-- 
  File: FUTURE-FEATURES.md
  Created: 2025-11-25
  Purpose: Document planned features for future implementation
-->

## Overview

Dokumen ini berisi fitur-fitur yang direncanakan untuk implementasi di masa depan.

---

## 1. Auto-Retry Mechanism

### Status: 📋 Planned (Low Priority)

### Deskripsi
Mekanisme untuk otomatis retry request yang gagal akibat masalah jaringan.

### Rencana Implementasi

```typescript
// React Query retry config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
})

// Custom useRetry hook
function useRetry<T>(fn: () => Promise<T>, maxRetries = 3) {
  // Exponential backoff implementation
}
```

### Estimasi: 6-9 jam

### Files yang Akan Dibuat
- `src/lib/queryClient.ts` - Retry config
- `src/hooks/useRetry.ts` - Custom hook
- `src/components/ui/retry-button.tsx` - UI component

---

## 2. Form Data Preservation

### Status: 📋 Planned (Medium Priority)

### Deskripsi
Auto-save form data ke localStorage untuk mencegah kehilangan data.

### Estimasi: 5-6 jam
