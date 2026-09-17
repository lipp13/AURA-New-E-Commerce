import {
  getAdminDashboardStatsService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  getAllSellersService,
  toggleSellerStatusService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
  getAllAdminProductsService,
  createAdminProductService,
  updateAdminProductService,
  deleteAdminProductService,
  getAllAdminOrdersService,
  verifyAdminOrderPaymentService,
} from '../services/admin.service.js';
import { getCategoriesService } from '../services/product.service.js';
import { successResponse, errorResponse, validationResponse } from '../utils/response.js';

// ─── Dashboard Stats ──────────────────────────────────────────
export async function getDashboard(req, res, next) {
  try {
    const stats = await getAdminDashboardStatsService();
    return successResponse(res, 'Statistik dashboard admin berhasil diambil.', stats, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

// ─── User Management ──────────────────────────────────────────
export async function getUsers(req, res, next) {
  try {
    const { search, role, page, limit } = req.query;
    const result = await getAllUsersService({ search, role, page, limit });
    return successResponse(res, 'Daftar pengguna berhasil diambil.', result.users, 200, result.pagination);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);
    return successResponse(res, 'Detail pengguna berhasil diambil.', user, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 404);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await updateUserService(id, req.body);
    return successResponse(res, 'Pengguna berhasil diperbarui.', updated, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

// ─── Seller Management ────────────────────────────────────────
export async function getSellers(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    const result = await getAllSellersService({ search, page, limit });
    return successResponse(res, 'Daftar seller berhasil diambil.', result.sellers, 200, result.pagination);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function toggleSellerStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const updated = await toggleSellerStatusService(id, is_active);
    return successResponse(res, 'Status toko seller berhasil diperbarui.', updated, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

// ─── Category Management ──────────────────────────────────────
export async function getCategories(req, res, next) {
  try {
    const categories = await getCategoriesService();
    return successResponse(res, 'Daftar kategori berhasil diambil.', categories, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return validationResponse(res, { name: 'Nama kategori wajib diisi.' });
    }
    const category = await createCategoryService(name, description);
    return successResponse(res, 'Kategori berhasil dibuat!', category, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updated = await updateCategoryService(id, name, description);
    return successResponse(res, 'Kategori berhasil diperbarui.', updated, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    await deleteCategoryService(id);
    return successResponse(res, 'Kategori berhasil dihapus.', null, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

// ─── Products Management ──────────────────────────────────────
export async function getProducts(req, res, next) {
  try {
    const { search, category, page, limit } = req.query;
    const result = await getAllAdminProductsService({ search, category, page, limit });
    return successResponse(res, 'Daftar seluruh produk berhasil diambil.', result.products, 200, result.pagination);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await createAdminProductService(req.user.id, req.body, req.file);
    return successResponse(res, 'Produk berhasil ditambahkan oleh Admin!', product, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await updateAdminProductService(id, req.body, req.file);
    return successResponse(res, 'Produk berhasil diperbarui oleh Admin.', updated, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await deleteAdminProductService(id);
    return successResponse(res, 'Produk berhasil dihapus.', null, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

// ─── Orders & Payment Verification ────────────────────────────
export async function getOrders(req, res, next) {
  try {
    const { status, search, payment, page, limit } = req.query;
    const result = await getAllAdminOrdersService({ status, search, payment, page, limit });
    return successResponse(res, 'Daftar seluruh pesanan berhasil diambil.', result.orders, 200, result.pagination);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function verifyOrderPayment(req, res, next) {
  try {
    const { id: orderId } = req.params;
    const { action, reason } = req.body;

    if (!action) {
      return validationResponse(res, { action: 'Tindakan (approve / reject) wajib disertakan.' });
    }

    if (action.toLowerCase() === 'reject' && (!reason || !reason.trim())) {
      return validationResponse(res, { reason: 'Alasan penolakan (reason) wajib diisi saat menolak pembayaran.' });
    }

    const updated = await verifyAdminOrderPaymentService(req.user.id, orderId, action, reason);
    const message = action.toLowerCase() === 'approve'
      ? 'Pembayaran berhasil diverifikasi & disetujui (ACC).'
      : 'Pembayaran pesanan berhasil ditolak (DECLINE).';

    return successResponse(res, message, updated, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}
