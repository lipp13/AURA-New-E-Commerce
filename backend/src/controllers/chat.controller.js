import {
  getConversationByOrderIdService,
  getConversationMessagesService,
  sendMessageService,
  sendAttachmentService,
} from '../services/chat.service.js';
import { successResponse, errorResponse, validationResponse } from '../utils/response.js';

export async function getConversationByOrder(req, res, next) {
  try {
    const { orderId } = req.query;
    if (!orderId) {
      return validationResponse(res, { orderId: 'Query parameter orderId wajib disertakan.' });
    }

    const result = await getConversationByOrderIdService(orderId, req.user);
    return successResponse(res, 'Percakapan berhasil ditemukan.', result, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 404);
  }
}

export async function getMessages(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    const messages = await getConversationMessagesService(conversationId, req.user);
    return successResponse(res, 'Daftar pesan berhasil diambil.', messages, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 403);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return validationResponse(res, { message: 'Teks pesan tidak boleh kosong.' });
    }

    const newMsg = await sendMessageService(conversationId, req.user, message);
    return successResponse(res, 'Pesan berhasil dikirim.', newMsg, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function sendAttachment(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    const file = req.file;

    if (!file) {
      return errorResponse(res, 'File lampiran wajib diunggah.', null, 400);
    }

    const result = await sendAttachmentService(conversationId, req.user, file);
    return successResponse(res, 'Lampiran berhasil dikirim.', result, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}
