import { Router } from 'express';
import { SocialController } from '../controllers/socialController.js';

const router = Router();

// Public routes for social media data
router.get('/trends', SocialController.getTrends);
router.get('/posts', SocialController.getSocialPosts);
router.get('/posts/location', SocialController.getPostsByLocation);

export default router;