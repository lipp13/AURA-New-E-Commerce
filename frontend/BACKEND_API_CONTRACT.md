# Panduan Integrasi Backend API — AURA E-Commerce

Dokumen ini berisi spesifikasi REST API yang dibutuhkan oleh frontend AURA E-Commerce agar dapat berkomunikasi secara langsung dengan backend Anda.

---

## 1. Konfigurasi Dasar

- **Base URL Frontend**: Dikonfigurasi melalui file `.env` di folder `frontend/`:
  ```env
  VITE_API_BASE_URL=https://e-commerce-be-dun.vercel.app/api
  ```
- **Header Autentikasi**:
  Frontend akan secara otomatis mengirimkan token JWT pada header setiap request (jika pengguna telah login):
  ```http
  Authorization: Bearer <token_jwt>
  Content-Type: application/json
  ```

---

## 2. Daftar Endpoint yang Diharapkan

### A. Autentikasi & Pengguna (`/auth`)

#### 1. Registrasi Akun Baru
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "password": "passwordRahasia123"
  }
  ```
- **Response Sukses (201 / 200)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "usr_101",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "role": "Member",
      "phone": "",
      "address": "",
      "city": "",
      "country": "Indonesia",
      "zip": ""
    }
  }
  ```

#### 2. Masuk Akun (Login)
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "budi@example.com",
    "password": "passwordRahasia123"
  }
  ```
- **Response Sukses (200)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "usr_101",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "phone": "+628123456789",
      "address": "Jl. Sudirman No. 10",
      "city": "Jakarta Pusat",
      "country": "Indonesia",
      "zip": "10220"
    }
  }
  ```

#### 3. Cek Profil Pengguna (Current User Session)
- **Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response Sukses (200)**:
  ```json
  {
    "user": {
      "id": "usr_101",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "phone": "+628123456789",
      "address": "Jl. Sudirman No. 10",
      "city": "Jakarta Pusat",
      "country": "Indonesia",
      "zip": "10220"
    }
  }
  ```

#### 4. Perbarui Profil Pengguna
- **Method**: `PUT`
- **Endpoint**: `/api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Budi Santoso, S.Ds.",
    "phone": "+628129876543",
    "address": "Jl. Thamrin No. 5",
    "city": "Jakarta Pusat",
    "country": "Indonesia",
    "zip": "10350"
  }
  ```
- **Response Sukses (200)**:
  ```json
  {
    "user": { ... }
  }
  ```

#### 5. Ubah Kata Sandi
- **Method**: `PUT`
- **Endpoint**: `/api/auth/password`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "currentPassword": "passwordLama123",
    "newPassword": "passwordBaru456"
  }
  ```
- **Response Sukses (200)**:
  ```json
  {
    "success": true,
    "message": "Kata sandi berhasil diperbarui"
  }
  ```

---

### B. Produk & Katalog (`/products`, `/categories`, `/brands`)

#### 1. Ambil Daftar Produk
- **Method**: `GET`
- **Endpoint**: `/api/products`
- **Query Params Opsional**:
  - `category`: slug atau nama kategori (misal: `electronics`, `fashion`)
  - `search`: kata kunci pencarian
  - `sort`: `popular`, `price-low`, `price-high`, `rating`, `newest`
- **Response Sukses (200)**:
  Format array langsung:
  ```json
  [
    {
      "id": "prod_1",
      "title": "Headphone Studio Akustik Titanium",
      "category": "Elektronik",
      "categorySlug": "electronics",
      "brand": "AURA Sound",
      "price": 349,
      "oldPrice": 399,
      "stock": 15,
      "rating": 4.9,
      "reviewCount": 48,
      "soldCount": 210,
      "description": "Headphone peredam bising aktif dengan diafragma titanium 40mm.",
      "images": [
        "https://domain.com/images/prod1-front.jpg",
        "https://domain.com/images/prod1-side.jpg"
      ],
      "colors": ["#171717", "#F5F1E8"],
      "specifications": {
        "Respon Frekuensi": "5Hz - 40kHz",
        "Konektivitas": "Bluetooth 5.3 & USB-C",
        "Garansi": "2 Tahun Resmi Studio"
      },
      "isBestseller": true,
      "isNewArrival": false
    }
  ]
  ```
  *(Catatan: Frontend juga mendukung jika format response berupa objek `{ "products": [ ... ] }`)*

#### 2. Ambil Detail Produk Berdasarkan ID
- **Method**: `GET`
- **Endpoint**: `/api/products/:id`
- **Response Sukses (200)**: Objek produk tunggal seperti skema di atas.

#### 3. Ambil Daftar Kategori (Opsional)
- **Method**: `GET`
- **Endpoint**: `/api/categories`
- **Response Sukses (200)**:
  ```json
  [
    { "id": "electronics", "name": "Elektronik", "count": 12 },
    { "id": "fashion", "name": "Busana", "count": 8 }
  ]
  ```

#### 4. Ambil Daftar Merek (Opsional)
- **Method**: `GET`
- **Endpoint**: `/api/brands`
- **Response Sukses (200)**:
  ```json
  [
    { "id": "sony", "name": "Sony" },
    { "id": "apple", "name": "Apple" }
  ]
  ```

---

### C. Pesanan & Checkout (`/orders`)

#### 1. Buat Pesanan Baru (Checkout)
- **Method**: `POST`
- **Endpoint**: `/api/orders`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "items": [
      {
        "productId": "prod_1",
        "title": "Headphone Studio Akustik Titanium",
        "price": 349,
        "quantity": 1,
        "selectedColor": "#171717",
        "selectedSize": null
      }
    ],
    "subtotal": 349,
    "discountAmount": 0,
    "shippingFee": 0,
    "tax": 28,
    "total": 377,
    "paymentMethod": "bank",
    "shippingData": {
      "firstName": "Budi",
      "lastName": "Santoso",
      "email": "budi@example.com",
      "address": "Jl. Sudirman No. 10",
      "city": "Jakarta Pusat",
      "country": "Indonesia",
      "zip": "10220"
    }
  }
  ```
- **Response Sukses (201 / 200)**:
  ```json
  {
    "id": "AU-948102",
    "date": "17 September 2026",
    "total": 377,
    "status": "Diproses",
    "tracking": "JNE YES 0182901928",
    "items": [ ... ]
  }
  ```

#### 2. Ambil Riwayat Pesanan Pengguna
- **Method**: `GET`
- **Endpoint**: `/api/orders`
- **Headers**: `Authorization: Bearer <token>`
- **Response Sukses (200)**: Array riwayat pesanan milik pengguna yang sedang login.

---

## 3. Format Penanganan Error Standar
Jika terjadi kesalahan validasi atau otorisasi, kembalikan status HTTP `400 / 401 / 404 / 500` dengan format JSON:
```json
{
  "message": "Pesan error spesifik yang akan langsung ditampilkan pada notifikasi toast di frontend"
}
```
Contoh:
- Email sudah terdaftar: Status 400, `{ "message": "Email ini sudah terdaftar. Silakan login." }`
- Password salah: Status 401, `{ "message": "Password yang Anda masukkan salah." }`
