import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import { recalculateMovieStats, sentimentFromRating } from '../utils/movieStats.js';
import { formatReviewSummary, generateReviewSummaryText } from '../utils/reviewSummary.js';

function serializeReview(review) {
  const username = review.userId?.username || review.username || 'User';
  const userId = review.userId?._id || review.userId;

  return {
    _id: review._id,
    userId,
    username,
    movieId: review.movieId,
    rating: review.rating,
    text: review.text,
    summary: formatReviewSummary(username, review.summaryText, review.rating, review.sentiment, review.text),
    summaryText: review.summaryText || '',
    likes: review.likes,
    sentiment: review.sentiment,
    createdAt: review.createdAt,
  };
}

export async function listByMovie(req, res) {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movieId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .lean();
    const mapped = reviews.map(serializeReview);
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function createReview(req, res) {
  try {
    const { movieId, rating, text } = req.body;
    const r = Number(rating);
    if (!movieId || r < 1 || r > 5) {
      return res.status(400).json({ message: 'movieId and rating 1–5 required' });
    }
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const sentiment = sentimentFromRating(r);
    const summaryText = await generateReviewSummaryText({ text, rating: r, sentiment });
    let review;
    try {
      review = await Review.create({
        userId: req.userId,
        movieId,
        rating: r,
        text: text || '',
        summaryText,
        likes: 0,
        sentiment,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'You already reviewed this movie' });
      }
      throw err;
    }
    await recalculateMovieStats(movieId);
    const populated = await Review.findById(review._id)
      .populate('userId', 'username')
      .lean();
    res.status(201).json(serializeReview(populated));
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function updateReview(req, res) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not your review' });
    }
    const { rating, text } = req.body;
    if (rating != null) {
      const r = Number(rating);
      if (r < 1 || r > 5) return res.status(400).json({ message: 'Invalid rating' });
      review.rating = r;
      review.sentiment = sentimentFromRating(r);
    }
    if (text != null) review.text = text;
    review.summaryText = await generateReviewSummaryText({
      text: review.text,
      rating: review.rating,
      sentiment: review.sentiment,
    });
    await review.save();
    await recalculateMovieStats(review.movieId);
    const populated = await Review.findById(review._id)
      .populate('userId', 'username')
      .lean();
    res.json(serializeReview(populated));
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function deleteReview(req, res) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const movieId = review.movieId;
    await review.deleteOne();
    await recalculateMovieStats(movieId);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function likeReview(req, res) {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    ).lean();
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ likes: review.likes });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}
