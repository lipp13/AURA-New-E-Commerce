import {
  getUserCartService,
  addToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
  toggleAllCartItemsService,
} from '../services/cart.service.js';
import { successResponse, errorResponse, validationResponse } from '../utils/response.js';

export async function getCart(req, res, next) {
  try {
    const cart = await getUserCartService(req.user.id);
    return successResponse(res, 'Keranjang berhasil diambil.', cart, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function addItemToCart(req, res, next) {
  try {
    const { productId, quantity = 1, isSelected = true } = req.body;

    if (!productId) {
      return validationResponse(res, { productId: 'Product ID wajib disertakan.' });
    }

    const item = await addToCartService(req.user.id, productId, quantity, isSelected);
    return successResponse(res, 'Produk berhasil ditambahkan ke keranjang!', item, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity, isSelected } = req.body;

    const updated = await updateCartItemService(req.user.id, id, { quantity, isSelected });
    return successResponse(res, 'Item keranjang berhasil diperbarui.', updated, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function removeCartItem(req, res, next) {
  try {
    const { id } = req.params;
    await removeCartItemService(req.user.id, id);
    return successResponse(res, 'Item berhasil dihapus dari keranjang.', null, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function clearCart(req, res, next) {
  try {
    await clearCartService(req.user.id);
    return successResponse(res, 'Keranjang berhasil dikosongkan.', null, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function toggleSelectAll(req, res, next) {
  try {
    const { isSelected } = req.body;
    await toggleAllCartItemsService(req.user.id, isSelected !== false);
    return successResponse(res, 'Status seleksi item berhasil diperbarui.', null, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}
