import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Movie from '../models/Movie.js';

export function sentimentFromRating(rating) {
  if (rating >= 4) return 'positive';
  if (rating === 3) return 'neutral';
  return 'negative';
}

function toObjectId(movieId) {
  if (movieId instanceof mongoose.Types.ObjectId) return movieId;
  return new mongoose.Types.ObjectId(String(movieId));
}

export async function recalculateMovieStats(movieId) {
  const oid = toObjectId(movieId);
  const id = oid.toString();
  const stats = await Review.aggregate([
    { $match: { movieId: oid } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avgRaw = stats[0]?.avgRating;
  const avgRating = avgRaw != null ? Math.round(avgRaw * 10) / 10 : 0;
  const reviewCount = stats[0]?.count ?? 0;

  await Movie.findByIdAndUpdate(id, { avgRating, reviewCount });
}

export async function getRatingBreakdown(movieId) {
  const oid = toObjectId(movieId);
  const rows = await Review.aggregate([
    { $match: { movieId: oid } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);
  const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of rows) {
    if (r._id >= 1 && r._id <= 5) map[r._id] = r.count;
  }
  return map;
}
