import { Router } from 'express';
import {
  getDashboard,
  getUsers,
  getUserById,
  updateUser,
  getSellers,
  toggleSellerStatus,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  verifyOrderPayment,
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { uploadProductImage, handleUploadError } from '../middleware/upload.middleware.js';

const router = Router();

// Protect all routes: Require Auth & Admin Role
router.use(requireAuth, requireAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);

// Seller Management
router.get('/sellers', getSellers);
router.patch('/sellers/:id', toggleSellerStatus);

// Category Management
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// All Products CRUD
router.get('/products', getProducts);
router.post('/products', handleUploadError(uploadProductImage), createProduct);
router.patch('/products/:id', handleUploadError(uploadProductImage), updateProduct);
router.delete('/products/:id', deleteProduct);

// All Orders & Payment Verification
router.get('/orders', getOrders);
router.patch('/orders/:id/verify', verifyOrderPayment);

export default router;
