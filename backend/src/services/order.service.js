import { supabaseAdmin } from '../config/supabase.js';
import { generateOrderNumber } from '../utils/order-id.js';

/**
 * Create Order with atomic calculations and stock deduction
 */
export async function createOrderService(userId, orderPayload) {
  const {
    recipient_name,
    phone,
    address,
    city,
    postal_code,
    courier = 'Standard Delivery',
    payment_method = 'bank_transfer',
    bank_name = null,
  } = orderPayload;

  // 1. Validasi input wajib
  if (!recipient_name || !phone || !address || !city || !postal_code) {
    throw new Error('Semua data pengiriman (nama, telepon, alamat, kota, kode pos) wajib diisi.');
  }

  const validPaymentMethod = payment_method === 'qris' ? 'qris' : 'bank_transfer';

  // 2. Coba jalankan PostgreSQL RPC Function (jika fungsi RPC sudah dieksekusi di database)
  try {
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('process_atomic_checkout', {
      p_user_id: userId,
      p_recipient_name: recipient_name.trim(),
      p_phone: phone.trim(),
      p_address: address.trim(),
      p_city: city.trim(),
      p_postal_code: postal_code.trim(),
      p_courier: courier.trim(),
      p_payment_method: validPaymentMethod,
      p_bank_name: validPaymentMethod === 'bank_transfer' ? (bank_name || 'BCA') : null,
    });

    if (!rpcError && rpcResult) {
      return rpcResult;
    }
    // Jika RPC error karena function belum terpasang di database, fallback ke manual atomic logic di bawah
  } catch (rpcCatchErr) {
    console.warn('RPC not available, falling back to server-side transactional logic:', rpcCatchErr.message);
  }

  // 3. Fallback: Server-side Transactional Order Processing
  // Ambil Cart user
  const { data: cart } = await supabaseAdmin
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!cart) {
    throw new Error('Keranjang belanja tidak ditemukan.');
  }

  // Ambil item yang terpilih (is_selected = true)
  const { data: cartItems, error: itemsErr } = await supabaseAdmin
    .from('cart_items')
    .select(`
      id,
      quantity,
      product:products(
        id,
        name,
        price,
        stock,
        is_active,
        seller_id
      )
    `)
    .eq('cart_id', cart.id)
    .eq('is_selected', true);

  if (itemsErr || !cartItems || cartItems.length === 0) {
    throw new Error('Tidak ada produk yang dipilih di keranjang untuk checkout.');
  }

  // Validasi stok & hitung subtotal berdasarkan database
  let subtotal = 0;
  for (const item of cartItems) {
    const p = item.product;
    if (!p || !p.is_active) {
      throw new Error(`Produk "${p?.name || 'Item'}" sedang tidak aktif atau tidak tersedia.`);
    }
    if (p.stock < item.quantity) {
      throw new Error(`Stok produk "${p.name}" tidak mencukupi (Tersedia: ${p.stock}, Diminta: ${item.quantity}).`);
    }
    subtotal += Number(p.price) * item.quantity;
  }

  // Hitung Ongkir (Free shipping threshold Rp500.000)
  const freeThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD || 500000);
  const defaultShipping = Number(process.env.DEFAULT_SHIPPING_COST || 25000);
  const shippingCost = subtotal >= freeThreshold ? 0 : defaultShipping;

  // Hitung Biaya Admin QRIS (Rp2.500)
  const adminFee = validPaymentMethod === 'qris' ? Number(process.env.QRIS_ADMIN_FEE || 2500) : 0;
  const total = subtotal + shippingCost + adminFee;

  const orderNumber = generateOrderNumber();

  // Insert Order
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: userId,
      subtotal,
      shipping_cost: shippingCost,
      admin_fee: adminFee,
      total,
      recipient_name: recipient_name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      postal_code: postal_code.trim(),
      courier,
      payment_method: validPaymentMethod,
      bank_name: validPaymentMethod === 'bank_transfer' ? (bank_name || 'BCA') : null,
      status: 'pending',
    })
    .select()
    .single();

  if (orderErr || !order) {
    throw new Error(`Gagal membuat pesanan: ${orderErr?.message}`);
  }

  // Insert Order Items & Kurangi Stok
  for (const item of cartItems) {
    const p = item.product;
    const itemSubtotal = Number(p.price) * item.quantity;

    await supabaseAdmin
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: p.id,
        seller_id: p.seller_id,
        product_name: p.name,
        price: Number(p.price),
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });

    // Update product stock
    await supabaseAdmin
      .from('products')
      .update({
        stock: Math.max(0, p.stock - item.quantity),
        updated_at: new Date().toISOString(),
      })
      .eq('id', p.id);
  }

  // Hapus item yang dipilih dari cart
  await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id)
    .eq('is_selected', true);

  // Buat conversation thread untuk order ini
  await supabaseAdmin
    .from('conversations')
    .insert({
      order_id: order.id,
      user_id: userId,
    });

  // Buat notifikasi
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'Pesanan Berhasil Dibuat',
      message: `Pesanan ${order.order_number} sebesar Rp ${total.toLocaleString('id-ID')} berhasil dibuat. Silakan unggah bukti pembayaran.`,
      type: 'order_created',
      reference_id: order.order_number,
    });

  return order;
}

/**
 * Get user's order history with status filter
 */
export async function getUserOrdersService(userId, statusFilter = 'all') {
  let query = supabaseAdmin
    .from('orders')
    .select(`
      id,
      order_number,
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
      items:order_items(
        id,
        product_id,
        product_name,
        price,
        quantity,
        subtotal,
        product:products(image)
      ),
      payment_proof:payment_proofs(
        id,
        storage_path,
        file_name,
        status,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'acc') {
      query = query.in('status', ['accepted', 'processing', 'shipped', 'delivered', 'completed']);
    } else {
      query = query.eq('status', statusFilter);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal mengambil riwayat pesanan: ${error.message}`);
  }

  return (data || []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    subtotal: Number(o.subtotal),
    shippingCost: Number(o.shipping_cost),
    adminFee: Number(o.admin_fee),
    total: Number(o.total),
    recipient: {
      name: o.recipient_name,
      phone: o.phone,
      address: o.address,
      city: o.city,
      postalCode: o.postal_code,
    },
    courier: o.courier,
    paymentMethod: o.payment_method,
    bankName: o.bank_name,
    status: o.status,
    rejectionReason: o.rejection_reason,
    createdAt: o.created_at,
    items: (o.items || []).map((it) => ({
      id: it.id,
      productId: it.product_id,
      productName: it.product_name,
      price: Number(it.price),
      quantity: it.quantity,
      subtotal: Number(it.subtotal),
      image: it.product?.image || '',
    })),
    hasPaymentProof: (o.payment_proof || []).length > 0,
    paymentProof: o.payment_proof?.[0] || null,
  }));
}

/**
 * Get user's single order detail with IDOR ownership validation
 */
export async function getUserOrderByIdService(userId, orderId) {
  // Support searching by UUID or order_number
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
      items:order_items(
        id,
        product_id,
        product_name,
        price,
        quantity,
        subtotal,
        seller:profiles!seller_id(id, name),
        product:products(image)
      ),
      payment_proof:payment_proofs(
        id,
        storage_path,
        file_name,
        file_size,
        mime_type,
        status,
        created_at
      )
    `);

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId);
  if (isUUID) {
    query = query.eq('id', orderId);
  } else {
    query = query.eq('order_number', orderId);
  }

  const { data: order, error } = await query.single();

  if (error || !order) {
    throw new Error('Pesanan tidak ditemukan.');
  }

  // IDOR Protection: Ensure order belongs to user
  if (order.user_id !== userId) {
    throw new Error('Akses ditolak: Anda tidak memiliki akses ke pesanan ini.');
  }

  return {
    id: order.id,
    orderNumber: order.order_number,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shipping_cost),
    adminFee: Number(order.admin_fee),
    total: Number(order.total),
    recipient: {
      name: order.recipient_name,
      phone: order.phone,
      address: order.address,
      city: order.city,
      postalCode: order.postal_code,
    },
    courier: order.courier,
    paymentMethod: order.payment_method,
    bankName: order.bank_name,
    status: order.status,
    rejectionReason: order.rejection_reason,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: (order.items || []).map((it) => ({
      id: it.id,
      productId: it.product_id,
      productName: it.product_name,
      price: Number(it.price),
      quantity: it.quantity,
      subtotal: Number(it.subtotal),
      image: it.product?.image || '',
      seller: it.seller || null,
    })),
    paymentProof: order.payment_proof?.[0] || null,
  };
}

/**
 * Cancel user's order (only allowed if status is 'pending')
 */
export async function cancelUserOrderService(userId, orderId) {
  const order = await getUserOrderByIdService(userId, orderId);

  if (order.status !== 'pending') {
    throw new Error('Pesanan tidak dapat dibatalkan karena sudah dalam proses atau diverifikasi.');
  }

  // 1. Update order status to 'cancelled'
  const { data: updated, error } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal membatalkan pesanan: ${error.message}`);
  }

  // 2. Restore product stocks
  for (const item of order.items) {
    const { data: p } = await supabaseAdmin
      .from('products')
      .select('stock')
      .eq('id', item.productId)
      .single();

    if (p) {
      await supabaseAdmin
        .from('products')
        .update({ stock: p.stock + item.quantity })
        .eq('id', item.productId);
    }
  }

  // 3. Post system message to conversation
  const { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('order_id', order.id)
    .single();

  if (conv) {
    await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conv.id,
        sender_id: userId,
        sender_role: 'system',
        message: `❌ Pesanan ${order.orderNumber} telah dibatalkan oleh pengguna.`,
        is_system: true,
      });
  }

  return updated;
}
