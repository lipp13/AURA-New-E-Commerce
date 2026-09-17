import {
  getSellerStoreService,
  updateSellerStoreService,
  getSellerProductsService,
  getSellerProductByIdService,
  createSellerProductService,
  updateSellerProductService,
  deleteSellerProductService,
  getSellerOrdersService,
  updateSellerOrderStatusService,
} from '../services/seller.service.js';
import { successResponse, errorResponse, validationResponse } from '../utils/response.js';

// ─── Store Profile ──────────────────────────────────────────
export async function getStore(req, res, next) {
  try {
    const store = await getSellerStoreService(req.user.id);
    return successResponse(res, 'Informasi toko berhasil diambil.', store, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function updateStore(req, res, next) {
  try {
    const updated = await updateSellerStoreService(req.user.id, req.body, req.file);
    return successResponse(res, 'Informasi toko berhasil diperbarui.', updated, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

// ─── Seller Products ─────────────────────────────────────────
export async function getProducts(req, res, next) {
  try {
    const products = await getSellerProductsService(req.user.id);
    return successResponse(res, 'Daftar produk seller berhasil diambil.', products, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await getSellerProductByIdService(req.user.id, id);
    return successResponse(res, 'Detail produk seller berhasil diambil.', product, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 404);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { name, price, stock, category_id } = req.body;
    const errors = {};

    if (!name || !name.trim()) errors.name = 'Nama produk wajib diisi.';
    if (price === undefined || isNaN(Number(price))) errors.price = 'Harga produk harus berupa angka.';
    if (stock === undefined || isNaN(Number(stock))) errors.stock = 'Stok produk harus berupa angka.';
    if (!category_id) errors.category_id = 'Kategori produk wajib dipilih.';

    if (Object.keys(errors).length > 0) {
      return validationResponse(res, errors, 'Data produk tidak lengkap.');
    }

    const product = await createSellerProductService(req.user.id, req.body, req.file);
    return successResponse(res, 'Produk berhasil ditambahkan!', product, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await updateSellerProductService(req.user.id, id, req.body, req.file);
    return successResponse(res, 'Produk berhasil diperbarui.', updated, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await deleteSellerProductService(req.user.id, id);
    return successResponse(res, 'Produk berhasil dihapus.', null, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

// ─── Seller Orders ───────────────────────────────────────────
export async function getOrders(req, res, next) {
  try {
    const orders = await getSellerOrdersService(req.user.id);
    return successResponse(res, 'Daftar pesanan seller berhasil diambil.', orders, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { id: orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return validationResponse(res, { status: 'Status baru wajib disertakan (processing, shipped, delivered, completed).' });
    }

    const updated = await updateSellerOrderStatusService(req.user.id, orderId, status);
    return successResponse(res, `Status pesanan berhasil diperbarui ke "${status}".`, updated, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}
