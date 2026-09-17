import { supabaseAdmin } from '../config/supabase.js';

/**
 * Get user's notifications
 */
export async function getUserNotificationsService(userId) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Gagal mengambil notifikasi: ${error.message}`);
  }

  return data || [];
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsReadService(userId, notificationId) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui status notifikasi: ${error.message}`);
  }

  return data;
}

/**
 * Mark all notifications as read for user
 */
export async function markAllNotificationsAsReadService(userId) {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Gagal memperbarui notifikasi: ${error.message}`);
  }

  return true;
}
