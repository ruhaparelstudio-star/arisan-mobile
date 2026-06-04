# GAP — Tidak Ada React Error Boundary

**Severity:** Tinggi  
**Status:** Diperbaiki di kode  
**File:** `App.tsx`, `src/components/ErrorBoundary.tsx` (baru)

## Masalah

Tanpa error boundary, uncaught render error di manapun dalam component tree akan menyebabkan:
- White screen tanpa pesan
- User tidak bisa melakukan apapun kecuali force-close app
- Crashlytics menerima error tapi UX user sangat buruk

`ErrorUtils.setGlobalHandler` di App.tsx menangkap error untuk Crashlytics tetapi tidak mencegah white screen.

## Solusi

Tambah `ErrorBoundary` class component yang wrap seluruh app di `App.tsx`.

### Fallback UI yang ditampilkan:
- Pesan error ramah dalam Bahasa Indonesia
- Tombol "Muat Ulang" yang reset state boundary (untuk recoverable errors)
- Tombol "Restart Aplikasi" (navigates to root) untuk unrecoverable errors
- Error dilaporkan ke Crashlytics

## Kode yang Diubah

### `src/components/ErrorBoundary.tsx` (file baru)
Class component React dengan `componentDidCatch` yang:
1. Catat error ke Crashlytics
2. Render fallback UI dengan tombol recovery

### `App.tsx`
Wrap `<AuthProvider>` dengan `<ErrorBoundary>`.
