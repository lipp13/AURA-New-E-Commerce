import { Router } from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);

// Authenticated auth endpoints
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getProfile);
router.patch('/me', requireAuth, updateProfile);

export default router;
