import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveWishlistToCart,
} from '../controllers/wishlist.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getWishlist);
router.post('/move-to-cart', moveWishlistToCart);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
