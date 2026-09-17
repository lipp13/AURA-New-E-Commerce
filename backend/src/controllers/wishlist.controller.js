import {
  getUserWishlistService,
  addToWishlistService,
  removeFromWishlistService,
  moveAllWishlistToCartService,
} from '../services/wishlist.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function getWishlist(req, res, next) {
  try {
    const wishlist = await getUserWishlistService(req.user.id);
    return successResponse(res, 'Wishlist berhasil diambil.', wishlist, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    const item = await addToWishlistService(req.user.id, productId);
    return successResponse(res, 'Produk berhasil ditambahkan ke wishlist!', item, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function removeFromWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    await removeFromWishlistService(req.user.id, productId);
    return successResponse(res, 'Produk dihapus dari wishlist.', null, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function moveWishlistToCart(req, res, next) {
  try {
    const result = await moveAllWishlistToCartService(req.user.id);
    return successResponse(res, `${result.movedCount} produk berhasil dipindahkan ke keranjang!`, result, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}
