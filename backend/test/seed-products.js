import { supabaseAdmin } from '../src/config/supabase.js';

async function seedProducts() {
  console.log('📦 Memasukkan produk-produk katalog awal ShopKu ke Supabase...\n');

  // 1. Ambil seller_id
  const { data: seller } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('role', 'seller')
    .limit(1)
    .single();

  if (!seller) {
    console.error('❌ Seller tidak ditemukan.');
    return;
  }

  // 2. Ambil categories
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('id, name');

  if (!categories || categories.length === 0) {
    console.error('❌ Kategori belum di-seed.');
    return;
  }

  const catMap = {};
  for (const c of categories) {
    catMap[c.name.toLowerCase()] = c.id;
  }

  const initialProducts = [
    {
      name: 'Wireless Headphones Pro',
      price: 899000,
      categoryName: 'electronics',
      description: 'Nikmati kualitas suara premium dengan teknologi Active Noise Cancellation. Driver 40mm menghasilkan bass yang dalam dan treble yang jernih. Konektivitas Bluetooth 5.3 dengan latensi ultra-rendah. Battery life hingga 30 jam penggunaan.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      rating: 4.8,
      reviews_count: 234,
      stock: 25,
      featured: true,
    },
    {
      name: 'Smart Watch Series X',
      price: 1299000,
      categoryName: 'electronics',
      description: 'Smartwatch dengan layar AMOLED 1.9 inci yang menakjubkan. Pantau kesehatan Anda dengan sensor detak jantung, SpO2, dan GPS built-in. Tahan air hingga 50 meter. Kompatibel dengan iOS dan Android.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
      rating: 4.6,
      reviews_count: 189,
      stock: 18,
      featured: true,
    },
    {
      name: 'Bluetooth Speaker Mini',
      price: 459000,
      categoryName: 'electronics',
      description: 'Speaker portabel dengan suara 360° yang mengisi ruangan. Desain tahan air IPX7, cocok untuk outdoor. Daya tahan baterai 12 jam. Sambungkan hingga 2 perangkat secara bersamaan dengan True Wireless Stereo.',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
      rating: 4.5,
      reviews_count: 312,
      stock: 40,
      featured: false,
    },
    {
      name: 'Running Shoes Ultra',
      price: 750000,
      categoryName: 'sports',
      description: 'Sepatu lari dengan teknologi foam reaktif yang mengembalikan energi setiap langkah Anda. Upper mesh breathable menjaga kaki tetap segar. Outsole karet karbon memberikan cengkeraman sempurna di berbagai permukaan.',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      rating: 4.7,
      reviews_count: 156,
      stock: 32,
      featured: true,
    },
    {
      name: 'Yoga Mat Premium',
      price: 320000,
      categoryName: 'sports',
      description: 'Matras yoga tebal 6mm dengan material TPE ramah lingkungan. Permukaan anti-slip double-sided memberikan stabilitas sempurna. Ukuran 183×61cm cocok untuk semua postur tubuh.',
      image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80',
      rating: 4.4,
      reviews_count: 98,
      stock: 55,
      featured: false,
    },
    {
      name: 'Slim Fit Polo Shirt',
      price: 189000,
      categoryName: 'fashion',
      description: 'Polo shirt pria berbahan cotton pique premium 220gsm. Potongan slim fit modern yang nyaman dipakai sepanjang hari. Tersedia dalam berbagai pilihan warna.',
      image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80',
      rating: 4.3,
      reviews_count: 421,
      stock: 80,
      featured: false,
    },
    {
      name: 'Leather Tote Bag',
      price: 545000,
      categoryName: 'fashion',
      description: 'Tas tote wanita dari kulit sapi asli full-grain yang mewah. Kapasitas besar dengan beberapa kompartemen terorganisir. Tali bahu adjustable yang nyaman.',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
      rating: 4.6,
      reviews_count: 87,
      stock: 15,
      featured: true,
    },
    {
      name: 'Ceramic Coffee Mug Set',
      price: 215000,
      categoryName: 'home & living',
      description: 'Set 4 mug keramik artisan dengan glasir matte yang elegan. Kapasitas 350ml per mug, aman untuk microwave dan dishwasher. Desain minimalis modern.',
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
      rating: 4.5,
      reviews_count: 203,
      stock: 60,
      featured: false,
    },
    {
      name: 'Minimalist Desk Lamp',
      price: 385000,
      categoryName: 'home & living',
      description: 'Lampu meja LED dengan desain Scandinavian yang timeless. 5 level kecerahan dan 3 mode warna (warm/natural/cool). Charging port USB-C terintegrasi.',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
      rating: 4.7,
      reviews_count: 145,
      stock: 28,
      featured: false,
    },
    {
      name: 'Vitamin C Serum',
      price: 279000,
      categoryName: 'beauty',
      description: 'Serum vitamin C 20% dengan formula stabil L-Ascorbic Acid. Mencerahkan kulit kusam, meratakan warna kulit, dan memudarkan noda hitam. Diperkaya dengan Vitamin E.',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
      rating: 4.8,
      reviews_count: 567,
      stock: 45,
      featured: true,
    },
    {
      name: 'Moisturizing Face Mask',
      price: 145000,
      categoryName: 'beauty',
      description: 'Sheet mask hyaluronic acid dengan serum melembapkan intensif. Memberikan hidrasi mendalam hingga 72 jam. Formula bebas paraben dan alkohol.',
      image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
      rating: 4.4,
      reviews_count: 334,
      stock: 90,
      featured: false,
    },
    {
      name: 'Portable Power Bank 20K',
      price: 349000,
      categoryName: 'electronics',
      description: 'Power bank 20.000mAh dengan teknologi Quick Charge 3.0 dan Power Delivery 22.5W. Isi daya 3 perangkat sekaligus dengan 2 port USB-A dan 1 USB-C. Dilengkapi layar LED digital.',
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80',
      rating: 4.5,
      reviews_count: 278,
      stock: 35,
      featured: false,
    },
    {
      name: 'Stiker Hologram ShopKu Special Edition',
      price: 1000,
      categoryName: 'home & living',
      description: 'Stiker hologram vinyl tahan air dengan logo eksklusif ShopKu. Cocok ditempel di laptop, tumbler, atau helm. Kualitas print tajam dan tidak meninggalkan bekas lem.',
      image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600&q=80',
      rating: 5.0,
      reviews_count: 42,
      stock: 100,
      featured: true,
    },
  ];

  for (const item of initialProducts) {
    const categoryId = catMap[item.categoryName.toLowerCase()] || Object.values(catMap)[0];

    const { data: existing } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('name', item.name)
      .single();

    if (!existing) {
      await supabaseAdmin.from('products').insert({
        seller_id: seller.id,
        category_id: categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        image: item.image,
        rating: item.rating,
        reviews_count: item.reviews_count,
        featured: item.featured,
        is_active: true,
      });
      console.log(`✅ Produk ditambahkan: ${item.name}`);
    } else {
      console.log(`ℹ️ Produk sudah ada: ${item.name}`);
    }
  }

  console.log('\n🏁 Selesai memasukkan produk katalog!');
}

seedProducts().catch(console.error);
