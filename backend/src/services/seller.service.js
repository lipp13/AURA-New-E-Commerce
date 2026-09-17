import { supabaseAdmin } from '../config/supabase.js';
import { uploadBufferToStorage, BUCKETS } from './storage.service.js';
import { createSystemMessageService } from './chat.service.js';

/**
 * Get or create store for seller
 */
export async function getSellerStoreService(sellerId) {
  const { data: store, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('seller_id', sellerId)
    .single();

  if (error || !store) {
    // If store not created yet, create a default store
    const { data: newStore } = await supabaseAdmin
      .from('stores')
      .insert({
        seller_id: sellerId,
        store_name: 'Toko Saya',
        description: 'Toko resmi di ShopKu.',
      })
      .select()
      .single();

    return newStore;
  }

  return store;
}

/**
 * Update seller store profile
 */
export async function updateSellerStoreService(sellerId, storeData, logoFile = null) {
  const payload = {};
  const allowed = ['store_name', 'description', 'phone', 'address', 'is_active'];

  for (const field of allowed) {
    if (storeData[field] !== undefined) {
      payload[field] = storeData[field];
    }
  }

  // Handle logo file upload
  if (logoFile) {
    const uploadResult = await uploadBufferToStorage(
      BUCKETS.STORE_ASSETS,
      logoFile,
      `stores/${sellerId}`
    );
    payload.logo = uploadResult.publicUrl || uploadResult.storagePath;
  }

  payload.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabaseAdmin
    .from('stores')
    .update(payload)
    .eq('seller_id', sellerId)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui informasi toko: ${error.message}`);
  }

  return updated;
}

/**
 * Get all products belonging to the seller
 */
export async function getSellerProductsService(sellerId) {
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      stock,
      image,
      rating,
      reviews_count,
      featured,
      is_active,
      created_at,
      updated_at,
      category:categories(id, name)
    `)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil produk seller: ${error.message}`);
  }

  return (products || []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    stock: p.stock,
    image: p.image,
    rating: Number(p.rating || 0),
    reviews: p.reviews_count || 0,
    featured: p.featured,
    isActive: p.is_active,
    category: p.category?.name || 'General',
    categoryId: p.category?.id,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));
}

/**
 * Get single product belonging to seller (with strict ownership check)
 */
export async function getSellerProductByIdService(sellerId, productId) {
  const { data: p, error } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      seller_id,
      name,
      description,
      price,
      stock,
      image,
      rating,
      reviews_count,
      featured,
      is_active,
      created_at,
      updated_at,
      category:categories(id, name)
    `)
    .eq('id', productId)
    .single();

  if (error || !p) {
    throw new Error('Produk tidak ditemukan.');
  }

  // Strict ownership check (anti-IDOR)
  if (p.seller_id !== sellerId) {
    throw new Error('Akses ditolak: Anda bukan pemilik produk ini.');
  }

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    stock: p.stock,
    image: p.image,
    rating: Number(p.rating || 0),
    reviews: p.reviews_count || 0,
    featured: p.featured,
    isActive: p.is_active,
    category: p.category?.name || 'General',
    categoryId: p.category?.id,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

/**
 * Create a new product by Seller
 */
export async function createSellerProductService(sellerId, productData, imageFile = null) {
  const { name, description, price, stock, category_id, featured, is_active } = productData;

  if (!name || price === undefined || stock === undefined || !category_id) {
    throw new Error('Nama produk, harga, stok, dan kategori wajib diisi.');
  }

  let imageUrl = productData.image || '';

  // Upload image to Supabase Storage if file provided
  if (imageFile) {
    const uploadResult = await uploadBufferToStorage(
      BUCKETS.PRODUCT_IMAGES,
      imageFile,
      `products/${sellerId}`
    );
    imageUrl = uploadResult.publicUrl || uploadResult.storagePath;
  }

  if (!imageUrl) {
    throw new Error('Gambar produk wajib diunggah atau disertakan URL gambarnya.');
  }

  const { data: newProduct, error } = await supabaseAdmin
    .from('products')
    .insert({
      seller_id: sellerId,
      category_id,
      name: name.trim(),
      description: description?.trim() || '',
      price: Number(price),
      stock: parseInt(stock) || 0,
      image: imageUrl,
      featured: Boolean(featured),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal menambahkan produk: ${error.message}`);
  }

  return newProduct;
}

/**
 * Update a product by Seller
 */
export async function updateSellerProductService(sellerId, productId, updateData, imageFile = null) {
  // 1. Verify product ownership
  await getSellerProductByIdService(sellerId, productId);

  const payload = { updated_at: new Date().toISOString() };
  const allowed = ['name', 'description', 'price', 'stock', 'category_id', 'featured', 'is_active', 'image'];

  for (const field of allowed) {
    if (updateData[field] !== undefined) {
      if (field === 'price') payload.price = Number(updateData.price);
      else if (field === 'stock') payload.stock = parseInt(updateData.stock);
      else if (field === 'featured') payload.featured = Boolean(updateData.featured);
      else if (field === 'is_active') payload.is_active = Boolean(updateData.is_active);
      else payload[field] = updateData[field];
    }
  }

  // Upload new image if file provided
  if (imageFile) {
    const uploadResult = await uploadBufferToStorage(
      BUCKETS.PRODUCT_IMAGES,
      imageFile,
      `products/${sellerId}`
    );
    payload.image = uploadResult.publicUrl || uploadResult.storagePath;
  }

  const { data: updated, error } = await supabaseAdmin
    .from('products')
    .update(payload)
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui produk: ${error.message}`);
  }

  return updated;
}

/**
 * Delete a product by Seller
 */
export async function deleteSellerProductService(sellerId, productId) {
  // 1. Verify ownership
  await getSellerProductByIdService(sellerId, productId);

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('seller_id', sellerId);

  if (error) {
    throw new Error(`Gagal menghapus produk: ${error.message}`);
  }

  return true;
}

/**
 * Get orders that contain items belonging to this seller
 */
export async function getSellerOrdersService(sellerId) {
  // Find all order_items belonging to this seller
  const { data: orderItems, error } = await supabaseAdmin
    .from('order_items')
    .select(`
      id,
      product_id,
      product_name,
      price,
      quantity,
      subtotal,
      order:orders(
        id,
        order_number,
        status,
        recipient_name,
        phone,
        address,
        city,
        courier,
        payment_method,
        created_at
      )
    `)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil data pesanan seller: ${error.message}`);
  }

  // Group by order
  const orderMap = {};
  for (const item of orderItems || []) {
    if (!item.order) continue;
    const orderId = item.order.id;

    if (!orderMap[orderId]) {
      orderMap[orderId] = {
        orderId: item.order.id,
        orderNumber: item.order.order_number,
        status: item.order.status,
        recipient: {
          name: item.order.recipient_name,
          phone: item.order.phone,
          address: item.order.address,
          city: item.order.city,
        },
        courier: item.order.courier,
        paymentMethod: item.order.payment_method,
        createdAt: item.order.created_at,
        sellerItems: [],
        sellerSubtotal: 0,
      };
    }

    const sub = Number(item.subtotal);
    orderMap[orderId].sellerItems.push({
      itemId: item.id,
      productId: item.product_id,
      productName: item.product_name,
      price: Number(item.price),
      quantity: item.quantity,
      subtotal: sub,
    });
    orderMap[orderId].sellerSubtotal += sub;
  }

  return Object.values(orderMap);
}

/**
 * Update order status by Seller (e.g. processing -> shipped -> delivered -> completed)
 */
export async function updateSellerOrderStatusService(sellerId, orderId, newStatus) {
  const allowedStatuses = ['processing', 'shipped', 'delivered', 'completed'];
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(`Status tidak valid. Pilihan status: ${allowedStatuses.join(', ')}`);
  }

  // 1. Verify seller has items in this order
  const { data: item } = await supabaseAdmin
    .from('order_items')
    .select('id, order:orders(id, order_number, status, user_id)')
    .eq('order_id', orderId)
    .eq('seller_id', sellerId)
    .limit(1)
    .single();

  if (!item || !item.order) {
    throw new Error('Akses ditolak: Anda tidak memiliki item pada pesanan ini.');
  }

  const currentStatus = item.order.status;

  // Seller can only process orders that have been accepted by Admin
  if (!['accepted', 'processing', 'shipped', 'delivered'].includes(currentStatus)) {
    throw new Error(`Pesanan berstatus "${currentStatus}" tidak dapat diproses oleh seller.`);
  }

  // 2. Update order status
  const { data: updated, error } = await supabaseAdmin
    .from('orders')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui status pesanan: ${error.message}`);
  }

  // 3. Post system message to conversation
  const { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('order_id', orderId)
    .single();

  const statusMessages = {
    processing: '📦 Pesanan Anda sedang dipersiapkan dan dikemas oleh Seller.',
    shipped: '🚚 Pesanan Anda telah diserahkan ke pihak ekspedisi dan dalam proses pengiriman.',
    delivered: '📬 Pesanan Anda telah sampai di alamat tujuan.',
    completed: '🎉 Pesanan telah selesai. Terima kasih telah berbelanja di ShopKu!',
  };

  if (conv && statusMessages[newStatus]) {
    await createSystemMessageService(conv.id, sellerId, statusMessages[newStatus], newStatus);
  }

  // 4. Create notification for buyer
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: item.order.user_id,
      title: `Status Pesanan: ${newStatus.toUpperCase()}`,
      message: statusMessages[newStatus] || `Pesanan Anda diperbarui ke status ${newStatus}.`,
      type: `order_${newStatus}`,
      reference_id: item.order.order_number,
    });

  return updated;
}
