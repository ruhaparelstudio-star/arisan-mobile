# Skenario Test Device — Production Ready Checklist

**Tanggal target:** 2026-06-04  
**Device:** Android (Redmi Note 8 atau setara)  
**API:** `https://arisan-api.vercel.app`  
**User 1 (Ketua):** `62895334719484`  
**User 2 (Anggota):** `6285692873673`  

Dokumen ini adalah skrip test end-to-end yang dijalankan manual di device fisik.  
Setiap langkah punya **Expected Result** dan kolom **STATUS** untuk diisi saat test.

---

## BAGIAN 0 — Setup Sebelum Test

### 0.1 — Pastikan Device Siap

```bash
# Cek device terhubung via USB
adb devices
# Harus muncul: <serial>    device

# Pastikan USB Debugging aktif di device
# Settings → Developer Options → USB Debugging: ON
```

### 0.2 — Build APK Production ke Device

```bash
cd /home/arsdev/projects/arisan_app/mobile

# Build dengan env production (loads .env.production)
APP_ENV=production npx expo run:android --device
```

> **Catatan:** Build ini menggunakan `.env.production` yang sudah dikonfigurasi dengan  
> `EXPO_PUBLIC_API_URL=https://arisan-api.vercel.app`. Nama app di device akan muncul sebagai **"Arisan"** (bukan "Arisan (Dev)").

**Cek setelah install:**
- [ ] App terinstall sebagai "Arisan" (bukan "Arisan (Dev)")
- [ ] App terbuka tanpa crash

---

### 0.3 — Bersihkan Database (WAJIB sebelum mulai test)

Buka **Supabase Dashboard** → Project `vqjfvbvmavwqapsznycp` → **SQL Editor**, lalu jalankan SQL berikut:

```sql
-- Hapus semua data test untuk kedua nomor HP ini
-- Urutan: dari tabel paling dalam (FK child) ke parent

DO $$
DECLARE
  u1_id UUID;
  u2_id UUID;
BEGIN
  -- Ambil UUID kedua user test
  SELECT id INTO u1_id FROM users WHERE phone = '+62895334719484';
  SELECT id INTO u2_id FROM users WHERE phone = '+6285692873673';

  -- Hapus data jika user ada
  IF u1_id IS NOT NULL OR u2_id IS NOT NULL THEN

    -- Hapus payments
    DELETE FROM payments
    WHERE user_id IN (u1_id, u2_id)
       OR confirmed_by IN (u1_id, u2_id);

    -- Hapus periods dari grup milik/diikuti user ini
    DELETE FROM periods
    WHERE group_id IN (
      SELECT group_id FROM group_members WHERE user_id IN (u1_id, u2_id)
    );

    -- Hapus winners
    DELETE FROM winners WHERE user_id IN (u1_id, u2_id);

    -- Hapus swap_requests
    DELETE FROM swap_requests
    WHERE requester_id IN (u1_id, u2_id)
       OR target_id IN (u1_id, u2_id);

    -- Hapus messages
    DELETE FROM messages
    WHERE user_id IN (u1_id, u2_id)
       OR group_id IN (
         SELECT group_id FROM group_members WHERE user_id IN (u1_id, u2_id)
       );

    -- Hapus activity_log
    DELETE FROM activity_log
    WHERE actor_id IN (u1_id, u2_id)
       OR group_id IN (
         SELECT group_id FROM group_members WHERE user_id IN (u1_id, u2_id)
       );

    -- Hapus notifications
    DELETE FROM notifications WHERE user_id IN (u1_id, u2_id);

    -- Hapus notif_log
    DELETE FROM notif_log WHERE user_id IN (u1_id, u2_id);

    -- Hapus push_tokens
    DELETE FROM push_tokens WHERE user_id IN (u1_id, u2_id);

    -- Hapus group_members
    DELETE FROM group_members WHERE user_id IN (u1_id, u2_id);

    -- Hapus grup yang dibuat salah satu dari mereka
    DELETE FROM groups
    WHERE ketua_id IN (u1_id, u2_id);

    -- Hapus OTP lama
    DELETE FROM otp_codes WHERE phone IN ('+62895334719484', '+6285692873673');
    DELETE FROM otp_rate_limit WHERE phone IN ('+62895334719484', '+6285692873673');
    DELETE FROM otp_delivery_log WHERE phone IN ('+62895334719484', '+6285692873673');

    -- Reset user ke fresh (hapus nama, pertahankan akun)
    UPDATE users SET name = NULL, deleted_at = NULL
    WHERE id IN (u1_id, u2_id);

    RAISE NOTICE 'Cleanup selesai untuk user1=% user2=%', u1_id, u2_id;
  ELSE
    RAISE NOTICE 'User tidak ditemukan — database sudah bersih atau perlu insert';
  END IF;
END;
$$;
```

**Atau jika ingin hapus user sekalian (fresh total):**
```sql
DELETE FROM users WHERE phone IN ('+62895334719484', '+6285692873673');
```

- [ ] SQL berhasil dijalankan tanpa error
- [ ] Verifikasi: `SELECT phone, name FROM users WHERE phone IN ('+62895334719484', '+6285692873673');`

---

## BAGIAN 1 — Auth Flow

### S1.1 — Splash Screen & Tombol Mulai

1. Buka app
2. Tunggu splash screen muncul

**Expected:**
- Splash screen tampil dengan logo dan warna hijau `#00C897`
- Teks consent "Dengan melanjutkan, kamu setuju dengan Kebijakan Privasi kami" tampil
- Tombol **"Mulai"** ada (hanya 1 tombol)

**STATUS:** `[ ] PASS  [ ] FAIL`  
**Catatan:**

---

### S1.2 — Input Nomor HP (User 1)

1. Tap **"Mulai"**
2. Masukkan nomor: `62895334719484` (tanpa +)
3. Tap **"Kirim OTP"**

**Expected:**
- Validasi format nomor: tidak error
- Loading indicator muncul saat request
- Berpindah ke layar OTP Verify
- OTP terkirim ke WA `62895334719484`

**STATUS:** `[ ] PASS  [ ] FAIL`  
**Catatan:**

---

### S1.3 — Verify OTP (User 1)

> **PAUSE:** Masukkan kode OTP yang diterima di WA `62895334719484`

1. Masukkan 6 digit OTP yang diterima
2. Tap **"Verifikasi"**

**Expected:**
- Loading saat proses
- Jika OTP benar → pindah ke **LoginSuccess**
- Tampil "Selamat datang!"

**STATUS:** `[ ] PASS  [ ] FAIL`  
**Catatan:**

---

### S1.4 — Set Nama Profil (User 1)

1. Di layar LoginSuccess (atau ProfileScreen), set nama: **"Anisa Ketua"**
2. Simpan

**Expected:**
- Nama tersimpan
- Navigasi ke **HomeScreen**
- Tab bar tampil (Beranda, Grup, Notifikasi, Profil)

**STATUS:** `[ ] PASS  [ ] FAIL`  
**Catatan:**

---

### S1.5 — Login User 2 (di device/emulator kedua atau setelah logout)

> **Catatan:** Jika hanya 1 device, jalankan skenario ini setelah S6 menggunakan logout dari ProfileScreen.

1. Dari ProfileScreen → Logout
2. Masukkan nomor: `6285692873673`
3. Tap **"Kirim OTP"**

> **PAUSE:** Masukkan OTP yang diterima di WA `6285692873673`

4. Verifikasi OTP
5. Set nama: **"Budi Anggota"**

**Expected:**
- Flow OTP sama dengan User 1
- Nama tersimpan, masuk HomeScreen

**STATUS:** `[ ] PASS  [ ] FAIL`  
**Catatan:**

---

## BAGIAN 2 — Buat Grup (User 1 sebagai Ketua)

> Login sebagai **User 1 (Anisa Ketua)**

### S2.1 — Navigasi ke Buat Grup

1. Tap tab **"Grup"**
2. Tap tombol **"+"** atau **"Buat Grup"**

**Expected:**
- Masuk ke BuatGrupStep1Screen

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S2.2 — Step 1: Info Dasar Grup

Isi form:
- Nama Grup: **"Arisan RT 07"**
- Nominal Iuran: **`200000`**
- Frekuensi: **Bulanan**

Tap **"Lanjut"**

**Expected:**
- Validasi OK (tidak ada error)
- Pindah ke Step 2

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S2.3 — Step 2: Jumlah Periode & Tanggal

Isi form:
- Jumlah Periode: **`2`**
- Jatuh Tempo Periode 1: (isi tanggal besok atau 3 hari dari sekarang, format YYYY-MM-DD)

Tap **"Lanjut"**

**Expected:**
- Pindah ke Step 3

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S2.4 — Step 3: Mode Undian

Pilih: **"Random (acak setiap periode)"**

Tap **"Buat Grup"**

**Expected:**
- Loading saat create
- Navigasi ke **InviteScreen**
- Kode undangan muncul (6-10 karakter, contoh: `HPTH9ZGD`)
- Member list tampil hanya "Anisa Ketua · Ketua"

**STATUS:** `[ ] PASS  [ ] FAIL`  
**Kode undangan:** `___________`

---

### S2.5 — Cek HomeScreen setelah Buat Grup

1. Tap Back atau navigasi ke **HomeScreen**

**Expected:**
- Grup "Arisan RT 07" muncul di HomeScreen
- Status: **Merekrut** (bukan active)
- Hero card tidak tampil (belum ada jatuh tempo aktif)

**STATUS:** `[ ] PASS  [ ] FAIL`

---

## BAGIAN 3 — Join Grup (User 2 sebagai Anggota)

> Login sebagai **User 2 (Budi Anggota)**

### S3.1 — Join via Kode Undangan

1. Tap tab **"Grup"**
2. Tap **"Masuk Grup"** atau **"Join"**
3. Masukkan kode dari S2.4

**Expected:**
- Preview grup muncul: nama "Arisan RT 07", nominal Rp 200.000, 2 periode

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S3.2 — Konfirmasi Join

1. Tap **"Gabung Grup"** atau **"Konfirmasi"**

**Expected:**
- Sukses bergabung
- Navigasi ke DetailGrupScreen atau GroupsScreen
- Member count: 2

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S3.3 — Cek InviteScreen (User 1) setelah User 2 Join

> Kembali ke **User 1**

1. Navigasi ke InviteScreen grup ini (dari DetailGrup → Undang)

**Expected:**
- Member list sekarang menampilkan 2 orang: "Anisa Ketua" dan "Budi Anggota"
- Polling realtime berjalan (refresh otomatis)

**STATUS:** `[ ] PASS  [ ] FAIL`

---

## BAGIAN 4 — Aktifkan Grup & Payment

> Login sebagai **User 1 (Ketua)**

### S4.1 — Start Grup

1. Buka **DetailGrupScreen** → Grup "Arisan RT 07"
2. Tap tombol **"Mulai Grup"** (ketua actions)
3. Konfirmasi

**Expected:**
- Status grup berubah ke **Active**
- Periode 1 muncul di status card
- Tombol "Bayar", "Undian", "Chat" aktif

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S4.2 — Lihat Status Bayar (PaymentStatusScreen)

1. Tap **"Bayar"** di DetailGrupScreen

**Expected:**
- PaymentStatusScreen terbuka
- Title: "Status Bayar — Periode 1"
- Semua anggota (2 orang) tampil dengan status **Belum Bayar**
- Progress bar: `0/2`
- Badge **Live** tampil
- Jatuh tempo muncul

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S4.3 — Konfirmasi Bayar User 1

1. Tap nama **"Anisa Ketua"** di list
2. Modal konfirmasi muncul
3. Tap **"Konfirmasi Lunas"**

**Expected:**
- Status User 1 berubah jadi **Lunas** (hijau)
- Progress bar: `1/2`
- Update realtime (tidak perlu refresh manual)

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S4.4 — Konfirmasi Bayar User 2

1. Tap nama **"Budi Anggota"** di list
2. Konfirmasi Lunas

**Expected:**
- Status User 2 berubah jadi **Lunas**
- Progress bar: `2/2`
- Notifikasi push terkirim ke User 2 (cek WA atau notif HP)

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S4.5 — Cek Realtime dari User 2

> Buka PaymentStatusScreen dari **User 2** di waktu yang sama

**Expected:**
- User 2 lihat progress `2/2` tanpa refresh manual
- Status-nya sendiri muncul **Lunas**

**STATUS:** `[ ] PASS  [ ] FAIL` (skip jika 1 device)

---

## BAGIAN 5 — Undian Flow (Mode Random)

> Login sebagai **User 1 (Ketua)**

### S5.1 — Navigasi ke UndianScreen

1. Dari DetailGrupScreen → tap **"Undian"**

**Expected:**
- UndianScreen terbuka
- Judul: "Undian Periode 1"
- Kandidat: 2 nama (Anisa Ketua, Budi Anggota)
- Tombol **"Mulai Undian"** aktif

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S5.2 — Jalankan Undian

1. Tap **"Mulai Undian"**
2. Tunggu animasi

**Expected:**
- Animasi rolling / acak berlangsung
- Navigasi ke **UndianResultScreen**
- Spotlight: nama pemenang tampil besar
- Konfetti atau animasi sukses
- Tombol **"Ucapkan selamat di chat"** ada

**STATUS:** `[ ] PASS  [ ] FAIL`  
**Pemenang Periode 1:** `___________`

---

### S5.3 — Cek DetailGrupScreen setelah Undian

1. Kembali ke DetailGrupScreen

**Expected:**
- Status card menampilkan nama pemenang Periode 1
- Tombol **"Undian"** sekarang **disabled** (undian sudah dilakukan)
- Tombol **"Tukar Giliran (Ketua)"** muncul di ketua actions

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S5.4 — Cek RiwayatPemenangScreen

1. Dari UndianResultScreen → tap **"Lihat semua"** atau dari DetailGrup

**Expected:**
- List pemenang per periode
- Periode 1: nama pemenang + tanggal

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S5.5 — Cek Undian dari User 2 (Anggota)

> Login **User 2** → buka UndianScreen

**Expected:**
- Tombol "Mulai Undian" **TIDAK ADA** (anggota biasa tidak bisa mulai undian)
- Tampil "Undian sudah selesai" dengan nama pemenang
- ATAU pill "Menunggu ketua memulai undian..." jika undian belum dilakukan

**STATUS:** `[ ] PASS  [ ] FAIL`

---

## BAGIAN 6 — Chat Flow

### S6.1 — Buka ChatScreen (User 1)

1. DetailGrupScreen → tap **"Chat"**

**Expected:**
- ChatScreen terbuka
- Ada system message dari undian (hasil undian tampil sebagai pesan sistem)
- Tab: "Semua", "Obrolan", "Sistem"

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S6.2 — Kirim Pesan

1. Ketik: **"Selamat ya yang menang!"**
2. Tap Send

**Expected:**
- Pesan muncul di list (optimistic update)
- Pesan tampil di bawah dengan nama "Anisa Ketua"

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S6.3 — Cek Realtime dari User 2

> **User 2** buka ChatScreen grup yang sama

**Expected:**
- Pesan dari User 1 muncul tanpa refresh
- Nama pengirim: "Anisa Ketua"
- Badge "Ketua" muncul di samping nama ketua

**STATUS:** `[ ] PASS  [ ] FAIL` (skip jika 1 device)

---

### S6.4 — Filter Tab Chat

1. Tap tab **"Sistem"**
2. Cek konten

**Expected:**
- Hanya system messages yang tampil (hasil undian, konfirmasi bayar)
- Pesan user tersembunyi

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S6.5 — ActivityLogScreen

1. Dari ChatScreen atau DetailGrupScreen → **"Log Aktivitas"**

**Expected:**
- Entri log muncul: Buat Grup, Join Grup, Konfirmasi Bayar, Undian
- Timestamp lokal format: "DD Mmm YYYY · HH:MM"
- Infinite scroll (pull to load more)

**STATUS:** `[ ] PASS  [ ] FAIL`

---

## BAGIAN 7 — Swap Flow

> Login sebagai **User 2 (Budi Anggota)**

### S7.1 — Request Swap

1. Buka DetailGrupScreen → tap **"Tukar"**
2. Pilih **"Request Tukar"**

**Expected:**
- RequestSwapScreen terbuka
- List anggota tampil (kecuali diri sendiri)
- Slot yang sudah menang disabled

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S7.2 — Pilih Target dan Submit

1. Pilih **"Anisa Ketua"** sebagai target tukar
2. Tap **"Request Tukar"**

**Expected:**
- Request terkirim
- Navigasi ke **SwapStatusScreen**
- Status step 1: "Request Dikirim" (aktif)
- Status step 2: "Menunggu Persetujuan Anggota" (pending)

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S7.3 — Accept Swap (User 1)

> Login **User 1** → tab **"Grup"** → **"Inbox Tukar"** ATAU dari notifikasi

1. Buka **SwapInboxScreen**
2. Lihat request dari "Budi Anggota"
3. Tap **"Terima"**

**Expected:**
- Status request berubah: "waiting_ketua"
- Alert konfirmasi sebelum terima

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S7.4 — Approve Swap sebagai Ketua

1. DetailGrupScreen → Ketua Actions → **"Approval Tukar"**
2. Buka **SwapApprovalScreen**
3. Tap **"Setujui"**

**Expected:**
- Swap status: approved
- Urutan giliran di DetailGrupScreen berubah

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S7.5 — Cek SwapStatusScreen (User 2)

> User 2 buka SwapStatusScreen untuk request ini

**Expected:**
- Semua 4 step tampil hijau (Approved)
- Tanggal approved tercantum

**STATUS:** `[ ] PASS  [ ] FAIL`

---

## BAGIAN 8 — Periode 2: Advance & Complete

> Login sebagai **User 1 (Ketua)**

### S8.1 — Atur Tanggal Pelaksanaan (opsional untuk Mode 2)

1. DetailGrupScreen → jika ada banner "Atur Tanggal Arisan" untuk pemenang Periode 1
2. Input tanggal: (hari ini atau kemarin, format YYYY-MM-DD)
3. Simpan

**Expected:**
- Tanggal tersimpan
- Banner hilang

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S8.2 — Close Periode 1 & Buka Periode 2

1. DetailGrupScreen → tap **"Tutup Periode"** (di ketua actions)
2. Konfirmasi

**Expected:**
- Periode 1 status: **closed**
- Periode 2 muncul sebagai **active**
- Status card update ke Periode 2

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S8.3 — Payment Periode 2

1. Tap **"Bayar"** → konfirmasi kedua anggota lunas

**Expected:**
- PaymentStatusScreen menampilkan "Periode 2"
- Progress `0/2` → `2/2` setelah konfirmasi

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S8.4 — Undian Periode 2

1. Tap **"Undian"** → Mulai Undian

**Expected:**
- Kandidat hanya **1 orang** (yang belum pernah menang)
- Pemenang otomatis: orang yang belum menang Periode 1

**STATUS:** `[ ] PASS  [ ] FAIL`  
**Pemenang Periode 2:** `___________`

---

### S8.5 — Close Periode 2 → Grup Completed

1. Tutup Periode 2

**Expected:**
- Semua periode closed
- Status grup berubah ke **completed**
- DetailGrupScreen menampilkan "Arisan Selesai"
- Ketua actions berubah (tidak ada lagi Mulai Undian, Bayar)

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S8.6 — Cek PaymentHistoryScreen

1. DetailGrupScreen → Riwayat Bayar

**Expected:**
- Accordion 2 periode
- Expand Periode 1: 2 anggota Lunas
- Expand Periode 2: 2 anggota Lunas
- Label pill: Periode 1 = "Selesai", Periode 2 = "Selesai"

**STATUS:** `[ ] PASS  [ ] FAIL`

---

## BAGIAN 9 — Profile & Stats

> Bisa dengan user mana pun

### S9.1 — ProfileScreen Stats

1. Tap tab **"Profil"**

**Expected:**
- Stats real (bukan 0):
  - Jumlah Grup: `1`
  - Total Iuran: `Rp 400.000` (2 periode × Rp 200.000)
  - Menang Undian: `1` (jika user ini menang)
- Nama user: "Anisa Ketua" / "Budi Anggota"

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S9.2 — Edit Nama

1. Tap nama profil atau tombol edit
2. Ubah nama menjadi **"Anisa (Updated)"**
3. Simpan

**Expected:**
- Nama berubah di ProfileScreen
- Nama baru muncul di ChatScreen dan list anggota

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S9.3 — Menu Profil

Cek semua menu:
- [ ] **Kebijakan Privasi** → buka URL di browser
- [ ] **Logout** → kembali ke SplashScreen
- [ ] **Hapus Akun** → minta konfirmasi 2 langkah

**STATUS:** `[ ] PASS  [ ] FAIL`

---

## BAGIAN 10 — Buku Arisan

### S10.1 — Buka BukuArisanScreen

1. DetailGrupScreen → tap **"Buku Arisan"** (di quick actions)

**Expected:**
- BukuArisanScreen terbuka
- Summary per periode (siapa menang, total terkumpul)
- Status hutang (jika ada)

**STATUS:** `[ ] PASS  [ ] FAIL`

---

## BAGIAN 11 — NotificationsScreen

### S11.1 — Lihat Notifikasi

1. Tap tab **"Notifikasi"**

**Expected:**
- Daftar notifikasi dari flow test (bayar dikonfirmasi, undian selesai)
- Bell icon di tab punya badge angka

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S11.2 — Mark All Read

1. Tap **"Tandai semua dibaca"**

**Expected:**
- Badge tab Notifikasi hilang
- Semua item tidak lagi bold/highlighted

**STATUS:** `[ ] PASS  [ ] FAIL`

---

## BAGIAN 12 — Offline Behavior

### S12.1 — Aktifkan Mode Pesawat

1. Aktifkan Airplane Mode di device
2. Buka **HomeScreen**

**Expected:**
- **OfflineBanner** merah muncul di bawah header
- Data cache tetap tampil (dari sebelumnya)
- Label "Data terakhir diperbarui: [waktu]"

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S12.2 — Aksi Disabled saat Offline

Cek semua aksi berikut TIDAK bisa dilakukan saat offline:
- [ ] Tombol "Bayar" → tooltip "Butuh koneksi internet"
- [ ] Tombol "Mulai Undian" → disabled
- [ ] Kirim pesan di Chat → input/tombol disabled
- [ ] Buat Grup → disabled atau error
- [ ] Request Swap → error message

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S12.3 — Kembali Online

1. Matikan Airplane Mode
2. Tunggu sekitar 5 detik

**Expected:**
- OfflineBanner slide-up dan hilang (animasi)
- Data refresh otomatis

**STATUS:** `[ ] PASS  [ ] FAIL`

---

## BAGIAN 13 — Test Mode Undian Lain (Opsional)

> Buat grup baru untuk test masing-masing mode

### S13.1 — Mode 1: Fixed (Urutan Tetap)

**Setup:**
1. Buat grup baru: "Test Fixed Mode", 3 periode, mode **"Urutan Tetap (fixed)"**
2. User 2 join, aktifkan grup

**Test:**
1. Set urutan giliran via **SetGiliranScreen** (ketua actions)
2. Konfirmasi payment periode 1
3. Jalankan undian → pemenang seharusnya urutan ke-1

**Expected:**
- Pemenang sesuai urutan, bukan random
- Setelah undian periode 1, ketua bisa close & buka periode 2

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S13.2 — Mode 3: Manual (Ketua Tentukan)

**Setup:**
1. Buat grup baru: "Test Manual Mode", 2 periode, mode **"Ketua Tentukan (manual)"**
2. User 2 join, aktifkan grup

**Test:**
1. Buka **UndianScreen** → tampil drag-drop list semua anggota
2. Atur urutan dengan drag (User 2 di atas)
3. Tap **"Simpan Urutan Pemenang"**

**Expected:**
- Urutan tersimpan (semua anggota punya slot_order)
- Tampil "Urutan sudah dikunci"
- Tombol Undian di DetailGrupScreen berubah disabled

**STATUS:** `[ ] PASS  [ ] FAIL`

---

## BAGIAN 14 — Validasi Input & Error Handling

### S14.1 — OTP Salah 3x

1. Kirim OTP ke salah satu nomor
2. Masukkan kode salah 3 kali

**Expected:**
- Setelah 3x gagal: link "Butuh bantuan? Hubungi support via WA" muncul
- Error message dalam Bahasa Indonesia

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S14.2 — Error Bahasa Indonesia

Cek semua pesan error di layar:
- [ ] Koneksi gagal → pesan Indonesia (bukan "Network Error")
- [ ] Data tidak ditemukan → pesan Indonesia
- [ ] Form tidak valid → pesan Indonesia

**STATUS:** `[ ] PASS  [ ] FAIL`

---

### S14.3 — Empty State

Buka state kosong:
- [ ] **NotificationsScreen** fresh → teks "Belum ada notifikasi" + ikon
- [ ] **GroupsScreen** fresh user baru → teks + CTA "Buat atau Gabung Grup"
- [ ] **RiwayatPemenangScreen** grup baru → teks deskriptif

**STATUS:** `[ ] PASS  [ ] FAIL`

---

## RINGKASAN HASIL TEST

| Bagian | Total Case | PASS | FAIL | Skip |
|--------|-----------|------|------|------|
| 0 — Setup | 3 | | | |
| 1 — Auth | 5 | | | |
| 2 — Buat Grup | 5 | | | |
| 3 — Join Grup | 3 | | | |
| 4 — Payment | 5 | | | |
| 5 — Undian | 5 | | | |
| 6 — Chat | 5 | | | |
| 7 — Swap | 5 | | | |
| 8 — Periode 2 | 6 | | | |
| 9 — Profile | 3 | | | |
| 10 — Buku Arisan | 1 | | | |
| 11 — Notifikasi | 2 | | | |
| 12 — Offline | 3 | | | |
| 13 — Mode Lain | 2 | | | |
| 14 — Validasi | 3 | | | |
| **TOTAL** | **56** | | | |

---

## CHECKLIST PUBLISH (semua harus PASS)

### Mandatory sebelum submit ke Play Store:

- [ ] Semua bagian 1–9 PASS tanpa FAIL
- [ ] `APP_ENV=production` terkonfirmasi (nama app "Arisan", bukan "Arisan (Dev)")
- [ ] API URL `https://arisan-api.vercel.app` berjalan, bukan localhost
- [ ] OTP terkirim via WA nyata (bukan sandbox)
- [ ] Push notification diterima di device (konfirmasi bayar, hasil undian)
- [ ] `google-services.json` asli dari Firebase Console (bukan template)
- [ ] `EXPO_PUBLIC_PRIVACY_POLICY_URL` diisi URL asli
- [ ] `EXPO_PUBLIC_SUPPORT_WA` diisi nomor WA support asli
- [ ] Tidak ada log `console.error` berlebihan di Metro
- [ ] TypeScript: `0 errors` (`npx tsc --noEmit`)

### Build final untuk Play Store:

```bash
# APK internal testing / preview
APP_ENV=production eas build --profile preview --local

# App Bundle untuk Play Store submission
APP_ENV=production eas build --profile production
```

---

## CATATAN PELAKSANAAN TEST

> Isi bagian ini saat menjalankan test

**Tanggal test:**  
**Device:**  
**Versi app (dari app.json → version):**  
**Tester:**  

**Issues ditemukan:**
1. 
2. 
3. 

**Keputusan:**  
`[ ] READY TO PUBLISH` `[ ] PERLU FIX DULU`
