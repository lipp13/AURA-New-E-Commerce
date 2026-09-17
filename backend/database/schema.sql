-- ==============================================================================
-- SHOPKU E-COMMERCE DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ==============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing triggers & tables if needed (Clean rebuild)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. PROFILES TABLE (Linked 1:1 with auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ------------------------------------------------------------------------------
-- 4. STORES TABLE (1:1 with Seller Profile)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    description TEXT,
    logo TEXT,
    phone VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_seller ON public.stores(seller_id);
CREATE INDEX IF NOT EXISTS idx_stores_active ON public.stores(is_active);

-- ------------------------------------------------------------------------------
-- 5. CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. PRODUCTS TABLE (Belongs to Seller & Category)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
    featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);

-- ------------------------------------------------------------------------------
-- 7. REVIEWS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating NUMERIC(3, 2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

-- ------------------------------------------------------------------------------
-- 8. CARTS & CART_ITEMS TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    is_selected BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);

-- ------------------------------------------------------------------------------
-- 9. WISHLISTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);

-- ------------------------------------------------------------------------------
-- 10. ORDERS & ORDER_ITEMS TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    subtotal NUMERIC(15, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_cost NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    admin_fee NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (admin_fee >= 0),
    total NUMERIC(15, 2) NOT NULL CHECK (total >= 0),
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    courier VARCHAR(50) DEFAULT 'Standard Delivery',
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('bank_transfer', 'qris')),
    bank_name VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'accepted', 'declined', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'
    )),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(15, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON public.order_items(seller_id);

-- ------------------------------------------------------------------------------
-- 11. PAYMENT_PROOFS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_order ON public.payment_proofs(order_id);

-- ------------------------------------------------------------------------------
-- 12. CONVERSATIONS & MESSAGES TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_order ON public.conversations(order_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('user', 'seller', 'admin', 'system')),
    message TEXT NOT NULL,
    attachment_path TEXT,
    attachment_type VARCHAR(50),
    is_system BOOLEAN DEFAULT FALSE,
    action VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);

-- ------------------------------------------------------------------------------
-- 13. NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

-- ------------------------------------------------------------------------------
-- 14. AUTOMATIC USER PROFILE TRIGGER (Supabase Auth to public.profiles)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, public.profiles.name);

    -- Automatically create a cart for newly registered users
    INSERT INTO public.carts (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 15. ATOMIC CHECKOUT RPC FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_atomic_checkout(
    p_user_id UUID,
    p_recipient_name VARCHAR,
    p_phone VARCHAR,
    p_address TEXT,
    p_city VARCHAR,
    p_postal_code VARCHAR,
    p_courier VARCHAR,
    p_payment_method VARCHAR,
    p_bank_name VARCHAR
)
RETURNS JSON AS $$
DECLARE
    v_cart_id UUID;
    v_order_id UUID;
    v_order_number VARCHAR;
    v_subtotal NUMERIC(15, 2) := 0;
    v_shipping_cost NUMERIC(15, 2) := 25000;
    v_admin_fee NUMERIC(15, 2) := 0;
    v_total NUMERIC(15, 2) := 0;
    v_item RECORD;
    v_product RECORD;
    v_selected_count INT := 0;
BEGIN
    -- 1. Dapatkan cart user
    SELECT id INTO v_cart_id FROM public.carts WHERE user_id = p_user_id LIMIT 1;
    IF v_cart_id IS NULL THEN
        RAISE EXCEPTION 'Keranjang belanja tidak ditemukan.';
    END IF;

    -- 2. Cek apakah ada item yang dipilih
    SELECT COUNT(*) INTO v_selected_count
    FROM public.cart_items
    WHERE cart_id = v_cart_id AND is_selected = TRUE;

    IF v_selected_count = 0 THEN
        RAISE EXCEPTION 'Tidak ada produk yang dipilih untuk checkout.';
    END IF;

    -- 3. Validasi stok dan hitung subtotal berdasarkan data terpercaya di DB
    FOR v_item IN
        SELECT ci.id AS item_id, ci.product_id, ci.quantity, p.name, p.price, p.stock, p.seller_id, p.is_active
        FROM public.cart_items ci
        JOIN public.products p ON p.id = ci.product_id
        WHERE ci.cart_id = v_cart_id AND ci.is_selected = TRUE
        FOR UPDATE OF p
    LOOP
        IF NOT v_item.is_active THEN
            RAISE EXCEPTION 'Produk "%" saat ini sedang tidak aktif.', v_item.name;
        END IF;

        IF v_item.stock < v_item.quantity THEN
            RAISE EXCEPTION 'Stok untuk produk "%" tidak mencukupi (Tersedia: %, Diminta: %).',
                v_item.name, v_item.stock, v_item.quantity;
        END IF;

        v_subtotal := v_subtotal + (v_item.price * v_item.quantity);
    END LOOP;

    -- 4. Hitung Gratis Ongkir (Threshold Rp500.000)
    IF v_subtotal >= 500000 THEN
        v_shipping_cost := 0;
    ELSE
        v_shipping_cost := 25000;
    END IF;

    -- 5. Hitung Biaya Admin QRIS (Rp2.500)
    IF p_payment_method = 'qris' THEN
        v_admin_fee := 2500;
    ELSE
        v_admin_fee := 0;
    END IF;

    v_total := v_subtotal + v_shipping_cost + v_admin_fee;

    -- 6. Generate Order Number unik
    v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

    -- 7. Insert Order
    INSERT INTO public.orders (
        order_number, user_id, subtotal, shipping_cost, admin_fee, total,
        recipient_name, phone, address, city, postal_code,
        courier, payment_method, bank_name, status
    ) VALUES (
        v_order_number, p_user_id, v_subtotal, v_shipping_cost, v_admin_fee, v_total,
        p_recipient_name, p_phone, p_address, p_city, p_postal_code,
        COALESCE(p_courier, 'Standard Delivery'), p_payment_method, p_bank_name, 'pending'
    ) RETURNING id INTO v_order_id;

    -- 8. Insert Order Items & Kurangi Stok secara atomik
    FOR v_item IN
        SELECT ci.product_id, ci.quantity, p.name, p.price, p.seller_id
        FROM public.cart_items ci
        JOIN public.products p ON p.id = ci.product_id
        WHERE ci.cart_id = v_cart_id AND ci.is_selected = TRUE
    LOOP
        -- Insert order item
        INSERT INTO public.order_items (
            order_id, product_id, seller_id, product_name, price, quantity, subtotal
        ) VALUES (
            v_order_id, v_item.product_id, v_item.seller_id, v_item.name,
            v_item.price, v_item.quantity, (v_item.price * v_item.quantity)
        );

        -- Kurangi stok produk
        UPDATE public.products
        SET stock = stock - v_item.quantity,
            updated_at = NOW()
        WHERE id = v_item.product_id;
    END LOOP;

    -- 9. Hapus item yang dipilih dari cart
    DELETE FROM public.cart_items
    WHERE cart_id = v_cart_id AND is_selected = TRUE;

    -- 10. Buat thread conversation untuk order ini
    INSERT INTO public.conversations (order_id, user_id)
    VALUES (v_order_id, p_user_id);

    -- 11. Buat notifikasi untuk user
    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
        p_user_id,
        'Pesanan Berhasil Dibuat',
        'Pesanan ' || v_order_number || ' berhasil dibuat. Silakan lakukan pembayaran.',
        'order_created',
        v_order_number
    );

    RETURN json_build_object(
        'order_id', v_order_id,
        'order_number', v_order_number,
        'subtotal', v_subtotal,
        'shipping_cost', v_shipping_cost,
        'admin_fee', v_admin_fee,
        'total', v_total,
        'status', 'pending'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 16. SUPABASE STORAGE BUCKET POLICIES SETUP INSTRUCTIONS
-- ------------------------------------------------------------------------------
-- Jalankan di Supabase Dashboard Storage -> Create Buckets:
-- 1. 'product-images' (Public bucket: true)
-- 2. 'payment-proofs' (Public bucket: false / authenticated access)
-- 3. 'chat-attachments' (Public bucket: false / authenticated access)
