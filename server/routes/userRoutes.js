import { Router } from 'express';
import { profile, myReviews, getFavorites, toggleFavorite } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/profile', auth, profile);
router.get('/reviews', auth, myReviews);
router.get('/favorites', auth, getFavorites);
router.post('/favorites/:movieId', auth, toggleFavorite);

export default router;
