import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  addReview,
} from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Public Product Catalog
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Authenticated reviews
router.post('/:id/reviews', requireAuth, addReview);

export default router;
