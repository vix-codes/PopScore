const Movie = require("../models/Movie");
const Review = require("../models/Review");

async function addReview(req, res) {
  try {
    const { userId, movieId, rating, text } = req.body;

    if (!userId || !movieId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "userId, movieId, and rating are required."
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found."
      });
    }

    const review = await Review.create({
      userId,
      movieId,
      rating,
      text
    });

    const reviews = await Review.find({ movieId });
    const reviewCount = reviews.length;
    const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);
    const avgRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 0;

    movie.avgRating = avgRating;
    movie.reviewCount = reviewCount;
    await movie.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully.",
      data: review
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add review.",
      error: error.message
    });
  }
}

async function getReviewsByMovie(req, res) {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movieId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
      error: error.message
    });
  }
}

module.exports = {
  addReview,
  getReviewsByMovie
};
