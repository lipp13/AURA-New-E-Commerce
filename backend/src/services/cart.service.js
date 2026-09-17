import { supabaseAdmin } from '../config/supabase.js';

/**
 * Get or create cart for user
 */
async function getOrCreateCartId(userId) {
  const { data: cart } = await supabaseAdmin
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (cart) return cart.id;

  const { data: newCart, error } = await supabaseAdmin
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (error || !newCart) {
    throw new Error('Gagal menginisialisasi keranjang belanja.');
  }

  return newCart.id;
}

/**
 * Get user's cart items with product details and calculated totals
 */
export async function getUserCartService(userId) {
  const cartId = await getOrCreateCartId(userId);

  const { data: items, error } = await supabaseAdmin
    .from('cart_items')
    .select(`
      id,
      quantity,
      is_selected,
      created_at,
      product:products(
        id,
        name,
        price,
        stock,
        image,
        is_active,
        category:categories(name),
        seller:profiles!seller_id(id, name)
      )
    `)
    .eq('cart_id', cartId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil data keranjang: ${error.message}`);
  }

  // Format cart items
  const formattedItems = (items || []).map((item) => {
    const p = item.product;
    const price = Number(p?.price || 0);
    const qty = item.quantity;
    const subtotal = price * qty;

    return {
      id: item.id,
      productId: p?.id,
      name: p?.name || 'Produk tidak tersedia',
      price,
      stock: p?.stock || 0,
      image: p?.image || '',
      category: p?.category?.name || 'General',
      seller: {
        id: p?.seller?.id,
        name: p?.seller?.name,
      },
      quantity: qty,
      isSelected: item.is_selected,
      subtotal,
      isAvailable: !!(p && p.is_active && p.stock > 0),
    };
  });

  // Calculate totals for selected items (Partial Checkout calculation)
  const selectedItems = formattedItems.filter((i) => i.isSelected && i.isAvailable);
  const subtotal = selectedItems.reduce((sum, i) => sum + i.subtotal, 0);
  const freeShippingThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD || 500000);
  const defaultShipping = Number(process.env.DEFAULT_SHIPPING_COST || 25000);
  const shippingCost = subtotal > 0 ? (subtotal >= freeShippingThreshold ? 0 : defaultShipping) : 0;
  const total = subtotal + shippingCost;

  return {
    cartId,
    items: formattedItems,
    summary: {
      totalItems: formattedItems.length,
      selectedCount: selectedItems.length,
      subtotal,
      shippingCost,
      freeShippingThreshold,
      isFreeShipping: subtotal >= freeShippingThreshold,
      remainingForFreeShipping: Math.max(0, freeShippingThreshold - subtotal),
      total,
    },
  };
}

/**
 * Add product to cart
 */
export async function addToCartService(userId, productId, quantity = 1, isSelected = true) {
  const cartId = await getOrCreateCartId(userId);
  const qty = Math.max(1, parseInt(quantity) || 1);

  // 1. Verify product existence and stock
  const { data: product, error: prodError } = await supabaseAdmin
    .from('products')
    .select('id, name, stock, is_active')
    .eq('id', productId)
    .single();

  if (prodError || !product || !product.is_active) {
    throw new Error('Produk tidak ditemukan atau sedang tidak aktif.');
  }

  if (product.stock <= 0) {
    throw new Error(`Maaf, stok produk "${product.name}" sedang habis.`);
  }

  // 2. Check if product already exists in cart
  const { data: existingItem } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .single();

  if (existingItem) {
    const newQty = Math.min(existingItem.quantity + qty, product.stock);
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('cart_items')
      .update({
        quantity: newQty,
        is_selected: isSelected,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingItem.id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);
    return updated;
  } else {
    const finalQty = Math.min(qty, product.stock);
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('cart_items')
      .insert({
        cart_id: cartId,
        product_id: productId,
        quantity: finalQty,
        is_selected: isSelected,
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);
    return inserted;
  }
}

/**
 * Update cart item quantity or selection state
 */
export async function updateCartItemService(userId, itemId, { quantity, isSelected }) {
  const cartId = await getOrCreateCartId(userId);

  // Verify item belongs to user's cart
  const { data: item, error: itemError } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity, product_id, product:products(name, stock, is_active)')
    .eq('id', itemId)
    .eq('cart_id', cartId)
    .single();

  if (itemError || !item) {
    throw new Error('Item keranjang tidak ditemukan.');
  }

  const payload = { updated_at: new Date().toISOString() };

  if (quantity !== undefined) {
    const qty = Math.max(1, parseInt(quantity) || 1);
    if (item.product?.stock && qty > item.product.stock) {
      throw new Error(`Stok maksimal untuk "${item.product.name}" adalah ${item.product.stock} unit.`);
    }
    payload.quantity = qty;
  }

  if (isSelected !== undefined) {
    payload.is_selected = Boolean(isSelected);
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('cart_items')
    .update(payload)
    .eq('id', itemId)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);
  return updated;
}

/**
 * Remove an item from cart
 */
export async function removeCartItemService(userId, itemId) {
  const cartId = await getOrCreateCartId(userId);

  const { error } = await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('cart_id', cartId);

  if (error) throw new Error(error.message);
  return true;
}

/**
 * Clear all items in cart
 */
export async function clearCartService(userId) {
  const cartId = await getOrCreateCartId(userId);

  const { error } = await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);

  if (error) throw new Error(error.message);
  return true;
}

/**
 * Toggle select all items in cart
 */
export async function toggleAllCartItemsService(userId, isSelected) {
  const cartId = await getOrCreateCartId(userId);

  const { error } = await supabaseAdmin
    .from('cart_items')
    .update({ is_selected: Boolean(isSelected), updated_at: new Date().toISOString() })
    .eq('cart_id', cartId);

  if (error) throw new Error(error.message);
  return true;
}
