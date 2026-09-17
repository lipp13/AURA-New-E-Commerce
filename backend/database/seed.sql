-- ==============================================================================
-- SHOPKU SEED DATA (CATEGORIES & INITIAL PRODUCTS)
-- ==============================================================================

-- 1. Insert Initial Categories
INSERT INTO public.categories (id, name, description)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Electronics', 'Perangkat elektronik canggih, gadget, audio, dan aksesori pintar.'),
    ('c0000000-0000-0000-0000-000000000002', 'Fashion', 'Pakaian, tas, sepatu, dan aksesori gaya hidup trendi.'),
    ('c0000000-0000-0000-0000-000000000003', 'Sports', 'Peralatan olahraga, fitness, perlengkapan outdoor, dan yoga.'),
    ('c0000000-0000-0000-0000-000000000004', 'Beauty', 'Perawatan kulit, serum, kosmetik, dan produk kecantikan premium.'),
    ('c0000000-0000-0000-0000-000000000005', 'Home & Living', 'Dekorasi rumah, peralatan dapur, lampu, dan perabot minimalis.')
ON CONFLICT (name) DO NOTHING;

-- 2. Panduan Akun Default (Didaftarkan melalui /api/auth/register atau Supabase Auth):
-- User: customer@store.com / password123 (role: 'user')
-- Seller: seller@store.com / password123 (role: 'seller')
-- Admin: admin@store.com / password123 (role: 'admin')
--
-- Catatan untuk Produk:
-- Produk dikaitkan dengan seller_id dari profil seller yang terdaftar.
-- Anda dapat membuat produk melalui endpoint POST /api/seller/products atau POST /api/admin/products.
