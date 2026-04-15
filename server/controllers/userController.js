import User from '../models/User.js';
import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import { formatReviewSummary } from '../utils/reviewSummary.js';

export async function profile(req, res) {
  try {
    const user = await User.findById(req.userId).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function myReviews(req, res) {
  try {
    const reviews = await Review.find({ userId: req.userId })
      .populate('movieId', 'title posterUrl year')
      .sort({ createdAt: -1 })
      .lean();
    res.json(
      reviews.map((review) => ({
        ...review,
        summary: formatReviewSummary('You', review.summaryText, review.rating, review.sentiment, review.text),
      }))
    );
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function getFavorites(req, res) {
  try {
    const user = await User.findById(req.userId).populate('favorites').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.favorites || []);
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function toggleFavorite(req, res) {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const user = await User.findById(req.userId);
    const idx = user.favorites.map((id) => id.toString()).indexOf(movieId);
    if (idx >= 0) {
      user.favorites.splice(idx, 1);
    } else {
      user.favorites.push(movieId);
    }
    await user.save();
    const populated = await User.findById(user._id).populate('favorites').lean();
    res.json({ favorites: populated.favorites });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}
