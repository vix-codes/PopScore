const Review = require("../models/Review");
const Movie = require("../models/Movie");

const updateMovieRating = async (movieId) => {
  const reviews = await Review.find({ movieId }).select("rating");
  const reviewCount = reviews.length;

  const avgRating =
    reviewCount === 0
      ? 0
      : Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
          ).toFixed(1)
        );

  await Movie.findByIdAndUpdate(movieId, {
    avgRating,
    reviewCount,
  });

  return { avgRating, reviewCount };
};

module.exports = updateMovieRating;
