import {
  getUserNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
} from '../services/notification.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function getNotifications(req, res, next) {
  try {
    const notifications = await getUserNotificationsService(req.user.id);
    return successResponse(res, 'Daftar notifikasi berhasil diambil.', notifications, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await markNotificationAsReadService(req.user.id, id);
    return successResponse(res, 'Notifikasi telah ditandai sebagai dibaca.', updated, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await markAllNotificationsAsReadService(req.user.id);
    return successResponse(res, 'Semua notifikasi telah ditandai sebagai dibaca.', null, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}
