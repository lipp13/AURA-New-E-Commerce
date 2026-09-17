# 🛒 ShopKu — Backend REST API (Node.js + Express + Supabase)

Dokumentasi resmi Backend REST API untuk **ShopKu E-Commerce Platform**. Backend ini dibangun menggunakan **Node.js**, **Express.js**, dan **Supabase (PostgreSQL, Supabase Auth, Supabase Storage)** untuk menggantikan penyimpanan berbasis browser (LocalStorage / SessionStorage) menjadi sistem database relasional yang aman, tersentralisasi, dan terproteksi dari kerentanan manipulasi client (*Anti-IDOR*, atomic checkout, dan verifikasi admin).

---

## 🌟 Fitur Utama Backend

* **3 Role System**: `user` (pembeli), `seller` (penjual dengan toko), dan `admin` (pengelola sistem).
* **Autentikasi Supabase Auth**: Registrasi, login, verifikasi JWT Bearer Token, dan sinkronisasi otomatis ke profil PostgreSQL.
* **Manajemen Produk Internal**: Disimpan di Supabase PostgreSQL dan gambar di Supabase Storage bucket `product-images` (tanpa API pihak ketiga).
* **Keranjang Belanja & Partial Checkout**: Checkbox pemilihan item untuk checkout sebagian atau seluruh isi keranjang.
* **Integritas Bisnis Terpusat**:
  * **Gratis Ongkir**: Threshold Rp 500.000 (Otomatis Rp 0 jika $\ge$ Rp 500.000, else Rp 25.000).
  * **Biaya Admin QRIS**: Rp 2.500 untuk metode QRIS, Rp 0 untuk Transfer Bank.
  * **Atomic Checkout & Stock Management**: Pengurangan stok dan pembuatan order secara atomik di level database.
* **Bukti Pembayaran & Verifikasi Admin**:
  * Upload foto bukti transfer ke Supabase Storage bucket `payment-proofs` (maks. 3MB).
  * Verifikasi Admin: **ACC (Approve)** $\rightarrow$ Diteruskan ke Seller; **DECLINE (Reject)** $\rightarrow$ Wajib menyertakan alasan penolakan.
* **Sistem Chat 2-Arah**: Percakapan real-time per pesanan antara pembeli, seller, dan admin beserta lampiran foto.
* **Notifikasi Pengguna**: Update real-time untuk status pesanan, pembayaran, dan pengiriman.
* **Dashboard Statistik Admin & Seller**: Metrik omzet, total user/seller/produk, dan status pesanan.

---

## 🏗️ Tech Stack

* **Runtime**: Node.js (v18+) ES Modules
* **Framework**: Express.js
* **Database**: PostgreSQL (Supabase)
* **Auth**: Supabase Auth (JWT)
* **File Storage**: Supabase Storage (`product-images`, `payment-proofs`, `chat-attachments`, `store-assets`)
* **Utilities**: Multer (Memory Buffer), CORS, Dotenv, Morgan

---

## 📁 Struktur Direktori Backend

```text
backend/
├── src/
│   ├── config/
│   │   └── supabase.js             # Konfigurasi Supabase Client (Anon & Service Role)
│   ├── controllers/
│   │   ├── auth.controller.js       # Controller Autentikasi & Profil
│   │   ├── product.controller.js    # Controller Katalog Produk Publik
│   │   ├── cart.controller.js       # Controller Keranjang Belanja
│   │   ├── wishlist.controller.js   # Controller Daftar Keinginan
│   │   ├── order.controller.js      # Controller Pemesanan & Checkout
│   │   ├── payment.controller.js    # Controller Bukti Pembayaran
│   │   ├── chat.controller.js       # Controller Chat Pesanan & Lampiran
│   │   ├── seller.controller.js     # Controller Toko, Produk Seller, & Order Seller
│   │   ├── admin.controller.js      # Controller Admin Dashboard, Verifikasi & Master Data
│   │   └── notification.controller.js # Controller Notifikasi Pengguna
│   ├── middleware/
│   │   ├── auth.middleware.js       # Middleware Verifikasi Token JWT Supabase
│   │   ├── role.middleware.js       # Middleware Otorisasi Role (user, seller, admin)
│   │   ├── upload.middleware.js     # Middleware Upload Multer & Filter MIME/Size
│   │   └── error.middleware.js      # Middleware Global Error & 404 Handler
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── order.routes.js
│   │   ├── payment.routes.js
│   │   ├── chat.routes.js
│   │   ├── seller.routes.js
│   │   ├── admin.routes.js
│   │   └── notification.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   ├── cart.service.js
│   │   ├── wishlist.service.js
│   │   ├── order.service.js
│   │   ├── payment.service.js
│   │   ├── chat.service.js
│   │   ├── seller.service.js
│   │   ├── admin.service.js
│   │   ├── notification.service.js
│   │   └── storage.service.js
│   ├── utils/
│   │   ├── response.js              # Standard JSON Response Formatter
│   │   ├── validation.js            # Input Validation Helpers
│   │   └── order-id.js              # Generator Nomor Order Unik
│   ├── app.js                       # Inisialisasi Express & Middleware
│   └── server.js                    # Server HTTP Listener
├── database/
│   ├── schema.sql                   # Skema DDL PostgreSQL Lengkap, Triggers, & RPC
│   └── seed.sql                     # Data Awal Kategori & Demo
├── test/
│   └── api.test.js                  # Automated Test Runner
├── .env.example
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Panduan Instalasi & Konfigurasi

### 1. Prasyarat
* Node.js versi 18 atau lebih baru.
* Akun dan Project di [Supabase](https://supabase.com).

### 2. Setup Supabase Database
1. Buka dashboard Supabase project Anda $\rightarrow$ **SQL Editor**.
2. Salin seluruh isi file [backend/database/schema.sql](file:///c:/Users/ECHA/Documents/client/backend/database/schema.sql) dan jalankan (**Run**).
3. Salin isi file [backend/database/seed.sql](file:///c:/Users/ECHA/Documents/client/backend/database/seed.sql) dan jalankan (**Run**) untuk mengisi data awal kategori.

### 3. Setup Supabase Storage
Buka menu **Storage** di dashboard Supabase, buat 4 bucket berikut:
1. `product-images` (Public bucket: **ON**)
2. `payment-proofs` (Public bucket: **OFF** atau **ON**)
3. `chat-attachments` (Public bucket: **OFF** atau **ON**)
4. `store-assets` (Public bucket: **ON**)

### 4. Konfigurasi Environment Variable (`.env`)
Salin file `.env.example` menjadi `.env`, lalu lengkapi isinya:
```env
PORT=5000
NODE_ENV=development

# Supabase Credentials dari Project Settings -> API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Client URLs untuk CORS
CLIENT_URL=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000

# E-Commerce Configuration
FREE_SHIPPING_THRESHOLD=500000
DEFAULT_SHIPPING_COST=25000
QRIS_ADMIN_FEE=2500
```

### 5. Jalankan Server
```bash
# Masuk ke direktori backend
cd backend

# Install dependencies
npm install

# Jalankan dalam mode development (auto-reload)
npm run dev

# Jalankan dalam mode production
npm start

# Jalankan pengujian API otomatis
npm test
```

Server akan aktif di `http://localhost:5000`.

---

## 📡 Dokumentasi Endpoint REST API

Semua respons API menggunakan format standar:
* **Success**: `{ "success": true, "message": "...", "data": ... }`
* **Error**: `{ "success": false, "message": "...", "error": ... }`
* **Validation**: `{ "success": false, "message": "Validation failed", "errors": { ... } }`

---

### 1. 🔑 Autentikasi (`/api/auth`)

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Publik | Mendaftarkan akun baru (`user`, `seller`, atau `admin`) |
| `POST` | `/api/auth/login` | Publik | Masuk dengan email & password, mengembalikan token JWT |
| `POST` | `/api/auth/logout` | User/Seller/Admin | Keluar dari sesi |
| `GET` | `/api/auth/me` | User/Seller/Admin | Mengambil data profil pengguna yang sedang login |
| `PATCH`| `/api/auth/me` | User/Seller/Admin | Memperbarui data profil (nama, telepon, avatar) |

---

### 2. 🛍️ Produk Publik (`/api/products`)

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Publik | Daftar produk dengan filter `?search=`, `?category=`, `?sort=`, `?featured=`, `?page=`, `?limit=` |
| `GET` | `/api/products/categories` | Publik | Mengambil daftar semua kategori produk |
| `GET` | `/api/products/:id` | Publik | Mengambil detail lengkap sebuah produk |
| `POST` | `/api/products/:id/reviews` | User | Menambahkan ulasan dan rating produk (1-5) |

---

### 3. 🛒 Keranjang Belanja (`/api/cart`)

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | User | Mengambil keranjang user beserta kalkulasi subtotal & gratis ongkir |
| `POST` | `/api/cart/items` | User | Menambahkan produk ke keranjang (`productId`, `quantity`, `isSelected`) |
| `PATCH`| `/api/cart/items/:id` | User | Mengubah jumlah (`quantity`) atau status centang checkout (`isSelected`) |
| `DELETE`| `/api/cart/items/:id`| User | Menghapus satu item dari keranjang |
| `DELETE`| `/api/cart` | User | Mengosongkan seluruh isi keranjang |
| `POST` | `/api/cart/select-all` | User | Mengaktifkan / menonaktifkan seluruh centang item keranjang |

---

### 4. ❤️ Wishlist (`/api/wishlist`)

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wishlist` | User | Mengambil daftar produk wishlist milik user |
| `POST` | `/api/wishlist/:productId` | User | Menambahkan produk ke wishlist |
| `DELETE`| `/api/wishlist/:productId`| User | Menghapus produk dari wishlist |
| `POST` | `/api/wishlist/move-to-cart` | User | Memindahkan seluruh item wishlist ke keranjang |

---

### 5. 📦 Pemesanan & Checkout (`/api/orders`)

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | User | Membuat pesanan baru dari item terpilih di cart (Atomic Checkout) |
| `GET` | `/api/orders` | User | Riwayat pesanan user (`?status=all|pending|acc|declined|completed`) |
| `GET` | `/api/orders/:id` | User | Detail pesanan lengkap milik user (Anti-IDOR) |
| `PATCH`| `/api/orders/:id/cancel`| User | Membatalkan pesanan (hanya jika status masih `pending`) |

---

### 6. 💳 Pembayaran & Bukti Transfer (`/api/orders/:id/payment-proof`)

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders/:id/payment-proof` | User | Upload file foto bukti transfer (Multipart `proof`, maks 3MB) |
| `GET` | `/api/orders/:id/payment-proof` | User/Admin | Mengambil data bukti pembayaran pesanan |

---

### 7. 💬 Chat Pesanan (`/api/chat`)

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/chat?orderId=...` | User/Seller/Admin | Mengambil atau menginisialisasi thread chat pesanan |
| `GET` | `/api/chat/:id/messages` | User/Seller/Admin | Mengambil seluruh pesan dalam percakapan |
| `POST` | `/api/chat/:id/messages` | User/Seller/Admin | Mengirim pesan teks |
| `POST` | `/api/chat/:id/attachment` | User/Seller/Admin | Mengirim lampiran file foto (Multipart `attachment`) |

---

### 8. 🏪 Panel Seller (`/api/seller`)

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/seller/store` | Seller | Mengambil profil toko seller |
| `PATCH`| `/api/seller/store` | Seller | Memperbarui informasi toko / upload logo |
| `GET` | `/api/seller/products` | Seller | Mengambil seluruh produk milik seller aktif |
| `GET` | `/api/seller/products/:id` | Seller | Detail produk seller (Anti-IDOR) |
| `POST` | `/api/seller/products` | Seller | Menambah produk baru (Multipart `image`) |
| `PATCH`| `/api/seller/products/:id` | Seller | Mengubah produk seller (Multipart `image`) |
| `DELETE`| `/api/seller/products/:id`| Seller | Menghapus produk seller |
| `GET` | `/api/seller/orders` | Seller | Daftar pesanan yang berisi item milik seller |
| `PATCH`| `/api/seller/orders/:id/status`| Seller | Update status pesanan (`processing`, `shipped`, `delivered`, `completed`) |

---

### 9. 🛡️ Panel Administrator (`/api/admin`)

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin | Statistik ringkasan (User, Seller, Produk, Omzet, Status Order) |
| `GET` | `/api/admin/users` | Admin | Kelola seluruh pengguna |
| `GET` | `/api/admin/users/:id` | Admin | Detail pengguna |
| `PATCH`| `/api/admin/users/:id` | Admin | Ubah role atau status pengguna |
| `GET` | `/api/admin/sellers` | Admin | Kelola seluruh toko seller |
| `PATCH`| `/api/admin/sellers/:id`| Admin | Aktifkan / Nonaktifkan toko seller |
| `GET` | `/api/admin/categories` | Admin | Daftar kategori |
| `POST` | `/api/admin/categories` | Admin | Tambah kategori baru |
| `PATCH`| `/api/admin/categories/:id`| Admin | Ubah nama / deskripsi kategori |
| `DELETE`| `/api/admin/categories/:id`| Admin | Hapus kategori |
| `GET` | `/api/admin/products` | Admin | Kelola seluruh produk dari semua seller |
| `POST` | `/api/admin/products` | Admin | Tambah produk oleh admin |
| `PATCH`| `/api/admin/products/:id` | Admin | Edit produk |
| `DELETE`| `/api/admin/products/:id` | Admin | Hapus produk |
| `GET` | `/api/admin/orders` | Admin | Daftar seluruh pesanan di sistem |
| `PATCH`| `/api/admin/orders/:id/verify` | Admin | **Verifikasi Pembayaran**: `{"action": "approve"}` atau `{"action": "reject", "reason": "..."}` |

---

### 10. 🔔 Notifikasi (`/api/notifications`)

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | User/Seller/Admin | Mengambil daftar notifikasi pengguna |
| `PATCH`| `/api/notifications/:id/read` | User/Seller/Admin | Menandai satu notifikasi sebagai telah dibaca |
| `PATCH`| `/api/notifications/read-all` | User/Seller/Admin | Menandai seluruh notifikasi sebagai telah dibaca |

---

## 📋 Dokumentasi Pemetaan Integrasi Frontend (`[FRONTEND IMPACT]`)

Bagian ini mendokumentasikan pemetaan modul JavaScript frontend yang nantinya akan dihubungkan ke backend REST API ini:

```text
[FRONTEND IMPACT]

File: js/auth.js
Functions: loginUser, registerUser, logoutUser, getCurrentUser
Perubahan yang dibutuhkan:
  - loginUser -> POST /api/auth/login, simpan res.data.token di sessionStorage/localStorage
  - registerUser -> POST /api/auth/register
  - logoutUser -> POST /api/auth/logout & hapus token lokal
  - getCurrentUser -> GET /api/auth/me menggunakan token Bearer
Alasan: Migrasi kredensial lokal ke Supabase Auth.
```

```text
[FRONTEND IMPACT]

File: js/products.js
Functions: getProducts, initProductsPage, initProductDetailPage
Perubahan yang dibutuhkan:
  - Ganti pembacaan localStorage.getItem('ec_products') menjadi fetch('http://localhost:5000/api/products')
  - Ganti detail produk menjadi fetch('http://localhost:5000/api/products/:id')
Alasan: Produk dikelola secara terpusat oleh Seller & Admin di database Supabase.
```

```text
[FRONTEND IMPACT]

File: js/cart.js
Functions: getCart, addToCart, updateCartQty, removeCartItem, toggleCartItemSelection
Perubahan yang dibutuhkan:
  - Ganti penyimpanan lokal cart menjadi GET /api/cart, POST /api/cart/items, PATCH /api/cart/items/:id, DELETE /api/cart/items/:id
Alasan: Sinkronisasi keranjang belanja multi-device yang tersimpan di database.
```

```text
[FRONTEND IMPACT]

File: js/checkout.js
Functions: submitOrder
Perubahan yang dibutuhkan:
  - Ganti fungsi lokal submitOrder menjadi HTTP POST /api/orders
Alasan: Validasi perhitungan harga, ongkir, biaya admin QRIS, dan pengurangan stok secara atomik di backend.
```

```text
[FRONTEND IMPACT]

File: js/order-service.js & js/chat-admin.js
Functions: submitPaymentProofService, getOrderChatMessagesService, sendChatMessageService
Perubahan yang dibutuhkan:
  - submitPaymentProofService -> POST /api/orders/:id/payment-proof menggunakan FormData (multipart)
  - getOrderChatMessagesService -> GET /api/chat/:id/messages
  - sendChatMessageService -> POST /api/chat/:id/messages
Alasan: File bukti pembayaran disimpan di Supabase Storage bucket 'payment-proofs' dan pesan tersimpan di tabel messages.
```

```text
[FRONTEND IMPACT]

File: js/admin.js
Functions: loadStats, renderAdminOrdersTable, adminVerifyOrderService, CRUD Products
Perubahan yang dibutuhkan:
  - loadStats -> GET /api/admin/dashboard
  - renderAdminOrdersTable -> GET /api/admin/orders
  - adminVerifyOrderService -> PATCH /api/admin/orders/:id/verify
  - Product CRUD -> GET/POST/PATCH/DELETE /api/admin/products
Alasan: Admin terhubung langsung ke data transaksi dan master produk PostgreSQL.
```
