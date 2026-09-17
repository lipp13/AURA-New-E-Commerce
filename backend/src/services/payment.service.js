import { supabaseAdmin } from '../config/supabase.js';
import { uploadBufferToStorage, BUCKETS } from './storage.service.js';
import { getUserOrderByIdService } from './order.service.js';

/**
 * Upload Payment Proof for an order
 */
export async function uploadPaymentProofService(userId, orderId, file, customNote = '') {
  if (!file) {
    throw new Error('File bukti transfer wajib diunggah.');
  }

  // 1. Verify order belongs to user
  const order = await getUserOrderByIdService(userId, orderId);

  // 2. Upload file to Supabase Storage bucket 'payment-proofs'
  const uploadResult = await uploadBufferToStorage(
    BUCKETS.PAYMENT_PROOFS,
    file,
    `orders/${order.id}`
  );

  // 3. Insert or update record in public.payment_proofs
  const { data: proof, error: proofErr } = await supabaseAdmin
    .from('payment_proofs')
    .insert({
      order_id: order.id,
      user_id: userId,
      storage_path: uploadResult.storagePath,
      file_name: uploadResult.fileName,
      mime_type: uploadResult.mimeType,
      file_size: uploadResult.fileSize,
      status: 'pending',
    })
    .select()
    .single();

  if (proofErr) {
    throw new Error(`Gagal mencatat bukti pembayaran: ${proofErr.message}`);
  }

  // 4. Reset order status to 'pending' if it was previously declined
  await supabaseAdmin
    .from('orders')
    .update({
      status: 'pending',
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  // 5. Find or create conversation for this order
  let { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('order_id', order.id)
    .single();

  if (!conv) {
    const { data: newConv } = await supabaseAdmin
      .from('conversations')
      .insert({ order_id: order.id, user_id: userId })
      .select('id')
      .single();
    conv = newConv;
  }

  // 6. Generate formatted confirmation message in conversation
  const formattedMessage = [
    'Konfirmasi Pembayaran',
    '',
    `Nama: ${order.recipient.name}`,
    `Order ID: ${order.orderNumber}`,
    `Total Tagihan: Rp ${order.total.toLocaleString('id-ID')}`,
    `Metode: ${order.paymentMethod === 'qris' ? 'QRIS' : `Transfer Bank (${order.bankName || 'BCA'})`}`,
    '',
    'Saya sudah melakukan pembayaran untuk pesanan tersebut.',
    customNote ? `Catatan: ${customNote.trim()}` : '',
    '',
    `[Lampiran: ${uploadResult.fileName}]`,
  ].filter(Boolean).join('\n');

  if (conv) {
    await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conv.id,
        sender_id: userId,
        sender_role: 'user',
        message: formattedMessage,
        attachment_path: uploadResult.storagePath,
        attachment_type: uploadResult.mimeType,
        is_system: false,
      });
  }

  return {
    proof,
    storagePath: uploadResult.storagePath,
    publicUrl: uploadResult.publicUrl,
  };
}

/**
 * Get payment proof for an order (user or admin/seller)
 */
export async function getPaymentProofService(orderId) {
  const { data: proof, error } = await supabaseAdmin
    .from('payment_proofs')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !proof) {
    return null;
  }

  return proof;
}
