import { Router } from 'express';
import {
  getStore,
  updateStore,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
} from '../controllers/seller.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireSeller } from '../middleware/role.middleware.js';
import { uploadProductImage, uploadAvatar, handleUploadError } from '../middleware/upload.middleware.js';

const router = Router();

// Protect all routes: Require Auth & Seller Role
router.use(requireAuth, requireSeller);

// Store Profile
router.get('/store', getStore);
router.post('/store', handleUploadError(uploadAvatar), updateStore);
router.patch('/store', handleUploadError(uploadAvatar), updateStore);

// Seller Products CRUD
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', handleUploadError(uploadProductImage), createProduct);
router.patch('/products/:id', handleUploadError(uploadProductImage), updateProduct);
router.delete('/products/:id', deleteProduct);

// Seller Order Management
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;
