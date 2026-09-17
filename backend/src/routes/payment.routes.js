import { Router } from 'express';
import {
  uploadPaymentProof,
  getPaymentProof,
  simulatePayment,
} from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadPaymentProof as uploadMiddleware, handleUploadError } from '../middleware/upload.middleware.js';

const router = Router();

router.use(requireAuth);

// Order instant simulation payment: POST /api/payments/orders/:id/simulate
router.post('/orders/:id/simulate', simulatePayment);

// Order payment proof endpoints: POST & GET /api/orders/:id/payment-proof
router.post('/orders/:id/payment-proof', handleUploadError(uploadMiddleware), uploadPaymentProof);
router.get('/orders/:id/payment-proof', getPaymentProof);

export default router;
