import {
  createOrderService,
  getUserOrdersService,
  getUserOrderByIdService,
  cancelUserOrderService,
} from '../services/order.service.js';
import { successResponse, errorResponse, validationResponse } from '../utils/response.js';
import { isValidPhone } from '../utils/validation.js';

export async function createOrder(req, res, next) {
  try {
    const {
      recipient_name,
      phone,
      address,
      city,
      postal_code,
      courier,
      payment_method,
      bank_name,
    } = req.body;

    const errors = {};
    if (!recipient_name || !recipient_name.trim()) errors.recipient_name = 'Nama penerima wajib diisi.';
    if (!phone || !isValidPhone(phone)) errors.phone = 'Nomor telepon tidak valid (Contoh: 08123456789).';
    if (!address || !address.trim()) errors.address = 'Alamat pengiriman wajib diisi.';
    if (!city || !city.trim()) errors.city = 'Kota tujuan wajib dipilih.';
    if (!postal_code || !postal_code.trim()) errors.postal_code = 'Kode pos wajib diisi.';

    if (Object.keys(errors).length > 0) {
      return validationResponse(res, errors, 'Data pesanan tidak lengkap.');
    }

    const order = await createOrderService(req.user.id, {
      recipient_name,
      phone,
      address,
      city,
      postal_code,
      courier,
      payment_method,
      bank_name,
    });

    return successResponse(res, 'Pesanan berhasil dibuat!', order, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function getOrders(req, res, next) {
  try {
    const { status } = req.query;
    const orders = await getUserOrdersService(req.user.id, status);
    return successResponse(res, 'Daftar pesanan berhasil diambil.', orders, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await getUserOrderByIdService(req.user.id, id);
    return successResponse(res, 'Detail pesanan berhasil diambil.', order, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 404);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;
    const cancelled = await cancelUserOrderService(req.user.id, id);
    return successResponse(res, 'Pesanan berhasil dibatalkan.', cancelled, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}
