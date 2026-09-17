import { registerService } from '../src/services/auth.service.js';

async function seedAccounts() {
  console.log('🚀 Mendaftarkan akun-akun pengujian ke Supabase...\n');

  const accounts = [
    {
      name: 'Administrator ShopKu',
      email: 'admin@store.com',
      password: 'password123',
      role: 'admin',
      phone: '08111111111',
    },
    {
      name: 'Toko Elektronik Official',
      email: 'seller@store.com',
      password: 'password123',
      role: 'seller',
      phone: '08222222222',
    },
    {
      name: 'Budi Santoso',
      email: 'customer@store.com',
      password: 'password123',
      role: 'user',
      phone: '08333333333',
    },
  ];

  for (const acc of accounts) {
    try {
      console.log(`⏳ Mendaftarkan [${acc.role.toUpperCase()}] ${acc.email}...`);
      const result = await registerService(acc.name, acc.email, acc.password, acc.role, acc.phone);
      console.log(`✅ BERHASIL: [${acc.role.toUpperCase()}] ${acc.email} terdaftar! (ID: ${result.user.id})\n`);
    } catch (err) {
      console.warn(`ℹ️ Status [${acc.role.toUpperCase()}]: ${err.message}\n`);
    }
  }

  console.log('🏁 Selesai proses pendaftaran akun!');
}

seedAccounts().catch(console.error);
