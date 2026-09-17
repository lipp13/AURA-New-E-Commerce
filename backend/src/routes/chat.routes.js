import { Router } from 'express';
import {
  getConversationByOrder,
  getMessages,
  sendMessage,
  sendAttachment,
} from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadChatAttachment, handleUploadError } from '../middleware/upload.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getConversationByOrder);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);
router.post('/:id/attachment', handleUploadError(uploadChatAttachment), sendAttachment);

export default router;
