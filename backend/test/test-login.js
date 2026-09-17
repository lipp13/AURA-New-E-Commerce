import { loginService } from '../src/services/auth.service.js';

async function testAllLogins() {
  console.log('🧪 Menguji Login untuk 3 Role di Supabase...\n');

  const accounts = [
    { email: 'admin@store.com', password: 'password123', expectedRole: 'admin' },
    { email: 'seller@store.com', password: 'password123', expectedRole: 'seller' },
    { email: 'customer@store.com', password: 'password123', expectedRole: 'user' },
  ];

  for (const acc of accounts) {
    try {
      const result = await loginService(acc.email, acc.password);
      console.log(`✅ LOGIN BERHASIL: ${acc.email}`);
      console.log(`   - Nama: ${result.user.name}`);
      console.log(`   - Role: ${result.user.role} (Expected: ${acc.expectedRole})`);
      console.log(`   - JWT Token: ${result.token ? 'Tersedia (' + result.token.substring(0, 20) + '...)' : 'Tidak ada'}`);
      if (result.user.store) {
        console.log(`   - Toko: ${result.user.store.store_name}`);
      }
      console.log('');
    } catch (err) {
      console.error(`❌ GAGAL: ${acc.email} - ${err.message}\n`);
    }
  }

  console.log('🏁 Pengujian Login Selesai!');
}

testAllLogins().catch(console.error);
