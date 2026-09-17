import { supabaseAdmin } from '../config/supabase.js';
import { uploadBufferToStorage, BUCKETS } from './storage.service.js';
import { createSystemMessageService } from './chat.service.js';

/**
 * Get Admin Dashboard Stats & Metrics
 */
export async function getAdminDashboardStatsService() {
  // 1. Total counts in parallel
  const [
    { count: totalUsers },
    { count: totalSellers },
    { count: totalProducts },
    { count: totalCategories },
    { data: ordersData, error: ordersErr },
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('id, status, total, created_at'),
  ]);

  if (ordersErr) {
    throw new Error(`Gagal menghitung statistik pesanan: ${ordersErr.message}`);
  }

  const orders = ordersData || [];
  const totalOrders = orders.length;

  let pendingOrders = 0;
  let acceptedOrders = 0;
  let declinedOrders = 0;
  let processingOrders = 0;
  let completedOrders = 0;
  let totalRevenue = 0;

  for (const o of orders) {
    if (o.status === 'pending') pendingOrders++;
    else if (o.status === 'accepted') acceptedOrders++;
    else if (o.status === 'declined') declinedOrders++;
    else if (o.status === 'processing') processingOrders++;
    else if (o.status === 'completed') {
      completedOrders++;
      totalRevenue += Number(o.total || 0);
    }
  }

  return {
    total_users: totalUsers || 0,
    total_sellers: totalSellers || 0,
    total_products: totalProducts || 0,
    total_categories: totalCategories || 0,
    total_orders: totalOrders,
    pending_orders: pendingOrders,
    accepted_orders: acceptedOrders,
    declined_orders: declinedOrders,
    processing_orders: processingOrders,
    completed_orders: completedOrders,
    total_revenue: totalRevenue,
  };
}

/**
 * User Management
 */
export async function getAllUsersService({ search = '', role = '', page = 1, limit = 20 }) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  let query = supabaseAdmin
    .from('profiles')
    .select('id, email, name, phone, role, avatar, created_at, updated_at', { count: 'exact' });

  if (role) {
    query = query.eq('role', role);
  }

  if (search && search.trim()) {
    const q = search.trim();
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    users: data || [],
    pagination: {
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    },
  };
}

export async function getUserByIdService(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) throw new Error('Pengguna tidak ditemukan.');
  return data;
}

export async function updateUserService(userId, updateData) {
  const payload = {};
  const allowed = ['name', 'phone', 'role'];

  for (const field of allowed) {
    if (updateData[field] !== undefined) {
      payload[field] = updateData[field];
    }
  }

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Seller Management
 */
export async function getAllSellersService({ search = '', page = 1, limit = 20 }) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  let query = supabaseAdmin
    .from('stores')
    .select(`
      id,
      store_name,
      description,
      logo,
      phone,
      address,
      is_active,
      created_at,
      seller:profiles(id, name, email, phone)
    `, { count: 'exact' });

  if (search && search.trim()) {
    query = query.ilike('store_name', `%${search.trim()}%`);
  }

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    sellers: data || [],
    pagination: {
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    },
  };
}

export async function toggleSellerStatusService(sellerStoreId, isActive) {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .update({ is_active: Boolean(isActive), updated_at: new Date().toISOString() })
    .eq('id', sellerStoreId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Categories CRUD
 */
export async function createCategoryService(name, description = '') {
  if (!name || !name.trim()) throw new Error('Nama kategori wajib diisi.');

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({ name: name.trim(), description: description?.trim() || null })
    .select()
    .single();

  if (error) throw new Error(`Gagal membuat kategori: ${error.message}`);
  return data;
}

export async function updateCategoryService(categoryId, name, description = '') {
  const payload = { updated_at: new Date().toISOString() };
  if (name) payload.name = name.trim();
  if (description !== undefined) payload.description = description?.trim() || null;

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(payload)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) throw new Error(`Gagal memperbarui kategori: ${error.message}`);
  return data;
}

export async function deleteCategoryService(categoryId) {
  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) throw new Error(`Gagal menghapus kategori: ${error.message}`);
  return true;
}

/**
 * All Products Management by Admin
 */
export async function getAllAdminProductsService({ search = '', category = '', page = 1, limit = 20 }) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  let query = supabaseAdmin
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
      category:categories(id, name),
      seller:profiles(id, name, email)
    `, { count: 'exact' });

  if (search && search.trim()) {
    query = query.ilike('name', `%${search.trim()}%`);
  }

  if (category && category !== 'all') {
    query = query.eq('category_id', category);
  }

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    products: data || [],
    pagination: {
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    },
  };
}

export async function createAdminProductService(adminId, productData, imageFile = null) {
  const { name, description, price, stock, category_id, seller_id, featured, is_active } = productData;

  if (!name || price === undefined || stock === undefined || !category_id) {
    throw new Error('Nama produk, harga, stok, dan kategori wajib diisi.');
  }

  const finalSellerId = seller_id || adminId;
  let imageUrl = productData.image || '';

  if (imageFile) {
    const uploadResult = await uploadBufferToStorage(
      BUCKETS.PRODUCT_IMAGES,
      imageFile,
      `products/${finalSellerId}`
    );
    imageUrl = uploadResult.publicUrl || uploadResult.storagePath;
  }

  if (!imageUrl) {
    throw new Error('Gambar produk wajib diunggah.');
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      seller_id: finalSellerId,
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

  if (error) throw new Error(`Gagal membuat produk: ${error.message}`);
  return data;
}

export async function updateAdminProductService(productId, updateData, imageFile = null) {
  const payload = { updated_at: new Date().toISOString() };
  const allowed = ['name', 'description', 'price', 'stock', 'category_id', 'seller_id', 'featured', 'is_active', 'image'];

  for (const field of allowed) {
    if (updateData[field] !== undefined) {
      if (field === 'price') payload.price = Number(updateData.price);
      else if (field === 'stock') payload.stock = parseInt(updateData.stock);
      else if (field === 'featured') payload.featured = Boolean(updateData.featured);
      else if (field === 'is_active') payload.is_active = Boolean(updateData.is_active);
      else payload[field] = updateData[field];
    }
  }

  if (imageFile) {
    const uploadResult = await uploadBufferToStorage(
      BUCKETS.PRODUCT_IMAGES,
      imageFile,
      `products/admin`
    );
    payload.image = uploadResult.publicUrl || uploadResult.storagePath;
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(payload)
    .eq('id', productId)
    .select()
    .single();

  if (error) throw new Error(`Gagal memperbarui produk: ${error.message}`);
  return data;
}

export async function deleteAdminProductService(productId) {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw new Error(`Gagal menghapus produk: ${error.message}`);
  return true;
}

/**
 * All Orders & Payment Verification by Admin
 */
export async function getAllAdminOrdersService({ status = '', search = '', payment = '', page = 1, limit = 20 }) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  let query = supabaseAdmin
    .from('orders')
    .select(`
      id,
      order_number,
      user_id,
      subtotal,
      shipping_cost,
      admin_fee,
      total,
      recipient_name,
      phone,
      address,
      city,
      postal_code,
      courier,
      payment_method,
      bank_name,
      status,
      rejection_reason,
      created_at,
      updated_at,
      user:profiles(id, name, email, phone),
      items:order_items(id, product_name, price, quantity, subtotal),
      payment_proofs(id, storage_path, file_name, status, created_at)
    `, { count: 'exact' });

  if (status && status !== 'all') {
    if (status === 'acc') {
      query = query.in('status', ['accepted', 'processing', 'shipped', 'delivered', 'completed']);
    } else {
      query = query.eq('status', status);
    }
  }

  if (payment) {
    query = query.eq('payment_method', payment);
  }

  if (search && search.trim()) {
    const q = search.trim();
    query = query.or(`order_number.ilike.%${q}%,recipient_name.ilike.%${q}%,phone.ilike.%${q}%,city.ilike.%${q}%`);
  }

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    orders: data || [],
    pagination: {
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    },
  };
}

/**
 * Verify Order Payment (Approve / Reject)
 */
export async function verifyAdminOrderPaymentService(adminId, orderId, action, reason = '') {
  const normalizedAction = (action || '').toLowerCase();

  if (normalizedAction !== 'approve' && normalizedAction !== 'reject') {
    throw new Error('Tindakan tidak valid. Harus "approve" (ACC) atau "reject" (DECLINE).');
  }

  if (normalizedAction === 'reject' && (!reason || !reason.trim())) {
    throw new Error('Alasan penolakan wajib diisi saat menolak (DECLINE) pembayaran.');
  }

  // 1. Fetch Order
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, user_id, total, status')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) {
    throw new Error('Pesanan tidak ditemukan.');
  }

  const newStatus = normalizedAction === 'approve' ? 'accepted' : 'declined';

  // 2. Update Order status
  const { data: updatedOrder, error: updateErr } = await supabaseAdmin
    .from('orders')
    .update({
      status: newStatus,
      rejection_reason: normalizedAction === 'reject' ? reason.trim() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .select()
    .single();

  if (updateErr) {
    throw new Error(`Gagal memverifikasi pesanan: ${updateErr.message}`);
  }

  // 3. Update payment_proof status
  await supabaseAdmin
    .from('payment_proofs')
    .update({
      status: normalizedAction === 'approve' ? 'approved' : 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', order.id);

  // 4. Post official system message to conversation
  const { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('order_id', order.id)
    .single();

  let systemText = '';
  if (normalizedAction === 'approve') {
    systemText = [
      '🎉 PEMBAYARAN TELAH DIVERIFIKASI (ACC)',
      '',
      `Pembayaran untuk pesanan ${order.order_number} sebesar Rp ${Number(order.total).toLocaleString('id-ID')} telah diverifikasi dan DITERIMA oleh Admin.`,
      'Pesanan sedang diteruskan ke seller untuk diproses.',
    ].join('\n');
  } else {
    systemText = [
      '⚠️ PEMBAYARAN DITOLAK (DECLINE)',
      '',
      `Pembayaran untuk pesanan ${order.order_number} tidak dapat diproses (DITOLAK) oleh Admin.`,
      '',
      `📌 Alasan Penolakan: ${reason.trim()}`,
      '',
      'Silakan unggah kembali bukti pembayaran yang sah jika ingin diverifikasi ulang.',
    ].join('\n');
  }

  if (conv) {
    await createSystemMessageService(conv.id, adminId, systemText, normalizedAction === 'approve' ? 'ACC' : 'DECLINE');
  }

  // 5. Create notification for buyer
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: order.user_id,
      title: normalizedAction === 'approve' ? 'Pembayaran Diterima' : 'Pembayaran Ditolak',
      message: normalizedAction === 'approve'
        ? `Pembayaran pesanan ${order.order_number} telah disetujui Admin.`
        : `Pembayaran pesanan ${order.order_number} ditolak. Alasan: ${reason.trim()}`,
      type: normalizedAction === 'approve' ? 'payment_approved' : 'payment_rejected',
      reference_id: order.order_number,
    });

  return updatedOrder;
}
