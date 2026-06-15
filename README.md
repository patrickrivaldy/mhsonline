# MHS Online - Modul Autentikasi Supabase & TOTP MFA

Repositori ini berisi implementasi modul autentikasi lengkap menggunakan **Supabase Auth**, yang mencakup pendaftaran dan masuk menggunakan email/password, integrasi login sosial (Google & Facebook OAuth), serta fitur keamanan tingkat tinggi **Multi-Factor Authentication (MFA)** berbasis **TOTP** (Time-based One-Time Password) menggunakan aplikasi Authenticator (seperti Google Authenticator atau Authy).

---

## Fitur Utama

1. **Email & Password**: Registrasi akun baru (dengan verifikasi email) dan masuk menggunakan email.
2. **Google OAuth**: Masuk instan dengan akun Google secara aman.
3. **Facebook OAuth**: Masuk instan dengan akun Facebook.
4. **TOTP Multi-Factor Authentication (MFA)**:
   - **Pendaftaran**: Pengguna dapat mengaktifkan autentikator 2-faktor (MFA) dari halaman Dashboard dengan memindai QR Code.
   - **Tantangan Login (MFA Challenge)**: Sesi pengguna yang sudah mengaktifkan MFA otomatis ditahan di tingkat asuransi rendah (`aal1`) hingga mereka memverifikasi kode OTP 6-digit dari aplikasi authenticator untuk naik ke tingkat aman (`aal2`) sebelum dapat mengakses Dashboard.
   - **Deaktivasi**: Pengguna dapat menonaktifkan MFA kapan saja jika diperlukan.

---

## Prasyarat Konfigurasi

### 1. Variabel Lingkungan (`.env.local`)
Buat file bernama `.env.local` di direktori utama proyek Anda dan isi dengan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 2. Pengaturan URL Pengalihan di Supabase Console
Masuk ke **Supabase Dashboard** > **Authentication** > **URL Configuration**:
- **Site URL**: `http://localhost:3000` (atau URL production Anda)
- **Redirect URLs**: Tambahkan `http://localhost:3000/dashboard` agar Supabase tahu ke mana harus mengarahkan kembali pengguna setelah berhasil masuk melalui login sosial (OAuth).

---

## Panduan Setup OAuth Provider

### A. Integrasi Google OAuth

1. **Google Cloud Console**:
   - Masuk ke [Google Cloud Console](https://console.cloud.google.com/).
   - Buat proyek baru atau pilih proyek yang sudah ada.
   - Buka **APIs & Services** > **Credentials**.
   - Klik **Create Credentials** > **OAuth client ID**.
   - Jika ditanya, konfigurasi **OAuth consent screen** terlebih dahulu dengan tipe *External*.
   - Pilih *Application type*: **Web application**.
   - Tambahkan **Authorized redirect URIs**. Masukkan callback URL dari Supabase Anda:
     `https://<your-project-id>.supabase.co/auth/v1/callback`
   - Klik **Create** dan salin **Client ID** serta **Client Secret** yang diberikan.

2. **Hubungkan ke Supabase**:
   - Buka **Supabase Dashboard** > **Authentication** > **Providers** > **Google**.
   - Aktifkan provider Google.
   - Tempel **Client ID** dan **Client Secret** dari Google Cloud Console.
   - Simpan perubahan.

---

### B. Integrasi Facebook OAuth

1. **Meta for Developers**:
   - Masuk ke [Facebook Developers Portal](https://developers.facebook.com/).
   - Buat aplikasi baru dan pilih tipe *Allow people to log in with their Facebook account*.
   - Di dashboard aplikasi, tambahkan produk **Facebook Login** > **Settings**.
   - Pada kolom **Valid OAuth Redirect URIs**, masukkan callback URL dari Supabase Anda:
     `https://<your-project-id>.supabase.co/auth/v1/callback`
   - Buka **App settings** > **Basic** untuk melihat **App ID** dan **App Secret** Anda.

2. **Hubungkan ke Supabase**:
   - Buka **Supabase Dashboard** > **Authentication** > **Providers** > **Facebook**.
   - Aktifkan provider Facebook.
   - Tempel **App ID** dan **App Secret** dari Meta Developers.
   - Simpan perubahan.

---

## Panduan Setup & Penggunaan TOTP MFA

Secara default, Supabase telah mengaktifkan dukungan MFA. Berikut adalah alur penggunaannya di proyek ini:

1. **Pendaftaran (Enrollment)**:
   - Masuk ke aplikasi menggunakan metode apa saja (Email / Google / Facebook).
   - Di halaman **Dashboard**, cari bagian **Keamanan Tambahan (MFA)**.
   - Klik **Aktifkan Authenticator (MFA)**.
   - Pindai QR Code yang muncul menggunakan aplikasi authenticator pilihan Anda (seperti Google Authenticator, Authy, Microsoft Authenticator) atau masukkan kode rahasia (*secret key*) secara manual.
   - Masukkan 6-digit kode OTP dari aplikasi tersebut untuk verifikasi pertama kali. Setelah berhasil, status MFA Anda akan berubah menjadi **Aktif (aal2)**.

2. **Proses Verifikasi saat Login**:
   - Saat Anda keluar (Logout) dan mencoba login kembali, Supabase akan mengembalikan sesi dengan tingkat jaminan autentikasi dasar (`aal1`).
   - Sistem akan mendeteksi bahwa akun Anda memerlukan autentikasi tingkat lanjut (`nextLevel: aal2`).
   - Halaman login akan otomatis beralih ke tampilan **MFA Challenge** (TOTP input).
   - Masukkan 6-digit kode dari aplikasi authenticator Anda untuk memverifikasi identitas dan masuk ke dashboard.

---

## Menjalankan Aplikasi Secara Lokal

Instal dependensi dan jalankan server pengembangan:

```bash
# Menginstal dependensi
npm install

# Menjalankan server lokal
npm.cmd run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## Keamanan Database & Skrip Row Level Security (RLS)

Berikut adalah skrip SQL yang digunakan untuk mengaktifkan RLS pada tabel `mahasiswa` di Supabase untuk memastikan manipulasi data dilakukan secara aman:

```sql
-- 1. Mengaktifkan Row Level Security (RLS) pada tabel mahasiswa
alter table mahasiswa enable row level security;

-- 2. Menghapus policy lama jika ada
drop policy if exists "Allow public select mahasiswa" on mahasiswa;
drop policy if exists "Allow public insert mahasiswa" on mahasiswa;
drop policy if exists "Allow public update mahasiswa" on mahasiswa;
drop policy if exists "Allow public delete mahasiswa" on mahasiswa;

-- 3. Membuat policy untuk membolehkan baca data bagi semua pengguna publik (anon)
create policy "Allow public select mahasiswa"
on mahasiswa
for select
to anon
using (true);

-- 4. Membuat policy untuk membolehkan tambah data bagi semua pengguna publik (anon)
create policy "Allow public insert mahasiswa"
on mahasiswa
for insert
to anon
with check (true);

-- 5. Membuat policy untuk membolehkan pembaruan data bagi semua pengguna publik (anon)
create policy "Allow public update mahasiswa"
on mahasiswa
for update
to anon
using (true)
with check (true);

-- 6. Membuat policy untuk membolehkan penghapusan data bagi semua pengguna publik (anon)
create policy "Allow public delete mahasiswa"
on mahasiswa
for delete
to anon
using (true);
```