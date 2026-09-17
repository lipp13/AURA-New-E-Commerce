import { supabaseAdmin } from '../config/supabase.js';
import { uploadBufferToStorage, BUCKETS } from './storage.service.js';

/**
 * Get or create conversation by Order ID with authorization check
 */
export async function getConversationByOrderIdService(orderId, currentUser) {
  // 1. Fetch Order details
  let orderQuery = supabaseAdmin
    .from('orders')
    .select(`
      id,
      order_number,
      user_id,
      total,
      payment_method,
      status,
      recipient_name,
      items:order_items(seller_id)
    `);

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId);
  if (isUUID) {
    orderQuery = orderQuery.eq('id', orderId);
  } else {
    orderQuery = orderQuery.eq('order_number', orderId);
  }

  const { data: order, error: orderErr } = await orderQuery.single();

  if (orderErr || !order) {
    throw new Error('Pesanan tidak ditemukan.');
  }

  // 2. Authorization check (IDOR Protection)
  const isOwner = order.user_id === currentUser.id;
  const isAdmin = currentUser.role === 'admin';
  const isSeller = (order.items || []).some((it) => it.seller_id === currentUser.id);

  if (!isOwner && !isAdmin && !isSeller) {
    throw new Error('Akses ditolak: Anda tidak memiliki akses ke percakapan pesanan ini.');
  }

  // 3. Find or create conversation
  let { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('order_id', order.id)
    .single();

  if (!conv) {
    const { data: newConv, error: createErr } = await supabaseAdmin
      .from('conversations')
      .insert({
        order_id: order.id,
        user_id: order.user_id,
      })
      .select()
      .single();

    if (createErr) {
      throw new Error(`Gagal membuat percakapan: ${createErr.message}`);
    }
    conv = newConv;
  }

  return {
    conversation: conv,
    order: {
      id: order.id,
      orderNumber: order.order_number,
      recipientName: order.recipient_name,
      total: Number(order.total),
      paymentMethod: order.payment_method,
      status: order.status,
    },
  };
}

/**
 * Get messages of a conversation
 */
export async function getConversationMessagesService(conversationId, currentUser) {
  // Verify access to conversation
  const { data: conv, error: convErr } = await supabaseAdmin
    .from('conversations')
    .select(`
      id,
      order_id,
      user_id,
      seller_id,
      order:orders(
        id,
        order_number,
        user_id,
        items:order_items(seller_id)
      )
    `)
    .eq('id', conversationId)
    .single();

  if (convErr || !conv) {
    throw new Error('Percakapan tidak ditemukan.');
  }

  const isOwner = conv.user_id === currentUser.id;
  const isAdmin = currentUser.role === 'admin';
  const isSeller = (conv.order?.items || []).some((it) => it.seller_id === currentUser.id);

  if (!isOwner && !isAdmin && !isSeller) {
    throw new Error('Akses ditolak ke pesan ini.');
  }

  // Fetch messages
  const { data: messages, error: msgErr } = await supabaseAdmin
    .from('messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      sender_role,
      message,
      attachment_path,
      attachment_type,
      is_system,
      action,
      created_at,
      sender:profiles(name, avatar)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (msgErr) {
    throw new Error(`Gagal mengambil pesan: ${msgErr.message}`);
  }

  return messages || [];
}

/**
 * Send a chat message
 */
export async function sendMessageService(conversationId, senderUser, messageText) {
  if (!messageText || !messageText.trim()) {
    throw new Error('Pesan tidak boleh kosong.');
  }

  const { data: msg, error } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderUser.id,
      sender_role: senderUser.role,
      message: messageText.trim(),
      is_system: false,
    })
    .select(`
      id,
      conversation_id,
      sender_id,
      sender_role,
      message,
      attachment_path,
      attachment_type,
      is_system,
      action,
      created_at
    `)
    .single();

  if (error) {
    throw new Error(`Gagal mengirim pesan: ${error.message}`);
  }

  return msg;
}

/**
 * Send an attachment in chat
 */
export async function sendAttachmentService(conversationId, senderUser, file) {
  if (!file) {
    throw new Error('File lampiran wajib disertakan.');
  }

  const uploadResult = await uploadBufferToStorage(
    BUCKETS.CHAT_ATTACHMENTS,
    file,
    `chats/${conversationId}`
  );

  const { data: msg, error } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderUser.id,
      sender_role: senderUser.role,
      message: `[Lampiran: ${uploadResult.fileName}]`,
      attachment_path: uploadResult.storagePath,
      attachment_type: uploadResult.mimeType,
      is_system: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal mengirim lampiran: ${error.message}`);
  }

  return {
    message: msg,
    publicUrl: uploadResult.publicUrl,
  };
}

/**
 * Create automated system message in conversation
 */
export async function createSystemMessageService(conversationId, senderId, text, action = null) {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_role: 'system',
      message: text,
      is_system: true,
      action: action,
    })
    .select()
    .single();

  return data;
}
