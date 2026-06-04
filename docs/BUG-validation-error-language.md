# BUG — Pesan Validasi Error Masih Bahasa Inggris

**Severity:** Low  
**Status:** Butuh perubahan backend  
**Ditemukan:** Device testing 2026-06-03  
**File:** `arisan-api/src/routes/*.ts` (backend)

## Masalah

Beberapa error validasi dari backend masih dalam Bahasa Inggris (format Zod default):

| Input | Response Saat Ini | Seharusnya |
|-------|-------------------|------------|
| Nama grup 1 huruf | `"Too small: expected string to have >=3 characters"` | "Nama grup minimal 3 karakter" |
| Nominal terlalu kecil | `"Too small: expected number to be >=10000"` | "Nominal minimal Rp 10.000" |
| Pesan kosong | `"Too small: expected string to have >=1 characters"` | "Pesan tidak boleh kosong" |
| Pesan >500 karakter | `"Too big: expected string to have <=500 characters"` | "Pesan maksimal 500 karakter" |

## Catatan Positif

- Tidak ada raw `ZodError` object yang bocor ke client ✅
- Tidak ada `{ "success": false, "error": {...} }` format ✅
- Error sudah di-unwrap menjadi string — hanya perlu lokalisasi

## Fix di Backend

Di `arisan-api`, ganti Zod `.message()` atau custom error handler untuk memberikan pesan Bahasa Indonesia. Contoh:

```typescript
// Di Zod schema:
z.string().min(3, 'Nama grup minimal 3 karakter')
z.number().min(10000, 'Nominal minimal Rp 10.000')
z.string().min(1, 'Pesan tidak boleh kosong').max(500, 'Pesan maksimal 500 karakter')
```

## Mobile Impact

Mobile tidak perlu perubahan — sudah menampilkan `e.message` dari `ApiError` langsung ke user. Begitu backend mengirim pesan Indonesia, mobile otomatis menampilkannya dengan benar.
