import { Router } from 'express';
import {
  listByMovie,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
} from '../controllers/reviewController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/', auth, createReview);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);
router.post('/:id/like', auth, likeReview);
router.get('/:movieId', listByMovie);

export default router;
