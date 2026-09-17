import {
  uploadPaymentProofService,
  getPaymentProofService,
  simulateOrderPaymentService,
} from '../services/payment.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function simulatePayment(req, res, next) {
  try {
    const { id: orderId } = req.params;
    const result = await simulateOrderPaymentService(req.user.id, orderId);
    return successResponse(res, result.message, result.order, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function uploadPaymentProof(req, res, next) {
  try {
    const { id: orderId } = req.params;
    const { note } = req.body;
    const file = req.file;

    if (!file) {
      return errorResponse(res, 'File foto bukti transfer wajib diunggah (JPG/PNG/WEBP, maks. 3MB).', null, 400);
    }

    const result = await uploadPaymentProofService(req.user.id, orderId, file, note);
    return successResponse(res, 'Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.', result, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function getPaymentProof(req, res, next) {
  try {
    const { id: orderId } = req.params;
    const proof = await getPaymentProofService(orderId);
    if (!proof) {
      return errorResponse(res, 'Bukti pembayaran belum diunggah untuk pesanan ini.', null, 404);
    }
    return successResponse(res, 'Bukti pembayaran berhasil diambil.', proof, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}
