import { Router } from 'express';
import {
  listMovies,
  topMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  recommendations,
} from '../controllers/movieController.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();

router.get('/top', topMovies);
router.get('/recommendations', auth, recommendations);
router.get('/', listMovies);
router.get('/:id', getMovie);
router.post('/', auth, admin, createMovie);
router.put('/:id', auth, admin, updateMovie);
router.delete('/:id', auth, admin, deleteMovie);

export default router;
