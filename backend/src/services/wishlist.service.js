import { supabaseAdmin } from '../config/supabase.js';
import { addToCartService } from './cart.service.js';

/**
 * Get user's wishlist
 */
export async function getUserWishlistService(userId) {
  const { data, error } = await supabaseAdmin
    .from('wishlists')
    .select(`
      id,
      product_id,
      created_at,
      product:products(
        id,
        name,
        description,
        price,
        stock,
        image,
        rating,
        reviews_count,
        is_active,
        category:categories(name)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil wishlist: ${error.message}`);
  }

  return (data || [])
    .filter((w) => w.product)
    .map((w) => ({
      wishlistId: w.id,
      productId: w.product.id,
      name: w.product.name,
      price: Number(w.product.price),
      stock: w.product.stock,
      image: w.product.image,
      rating: Number(w.product.rating || 0),
      reviews: w.product.reviews_count || 0,
      category: w.product.category?.name || 'General',
      isAvailable: w.product.is_active && w.product.stock > 0,
      addedAt: w.created_at,
    }));
}

/**
 * Add product to wishlist
 */
export async function addToWishlistService(userId, productId) {
  // Check if product exists
  const { data: product, error: prodErr } = await supabaseAdmin
    .from('products')
    .select('id, name')
    .eq('id', productId)
    .single();

  if (prodErr || !product) {
    throw new Error('Produk tidak ditemukan.');
  }

  const { data, error } = await supabaseAdmin
    .from('wishlists')
    .upsert({ user_id: userId, product_id: productId })
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal menambahkan ke wishlist: ${error.message}`);
  }

  return data;
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlistService(userId, productId) {
  const { error } = await supabaseAdmin
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    throw new Error(`Gagal menghapus dari wishlist: ${error.message}`);
  }

  return true;
}

/**
 * Move all wishlist items to shopping cart
 */
export async function moveAllWishlistToCartService(userId) {
  const wishlistItems = await getUserWishlistService(userId);
  let movedCount = 0;

  for (const item of wishlistItems) {
    if (item.isAvailable) {
      await addToCartService(userId, item.productId, 1, true);
      await removeFromWishlistService(userId, item.productId);
      movedCount++;
    }
  }

  return { movedCount, totalItems: wishlistItems.length };
}
