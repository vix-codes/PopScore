// controllers/reviewController.js

/*
const Review = require("../models/Review");
const Movie = require("../models/Movie");

// ✅ GET Reviews by Movie
exports.getReviewsByMovie = async (req, res) => {
  try {
    const reviews = await Review.find({
      movieId: req.params.movieId
    });

    res.json({
      success: true,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ✅ ADD Review + Rating Calculation
exports.addReview = async (req, res) => {
  try {
    const { movieId, userId, rating, text } = req.body;

    if (!movieId || !userId || !rating) {
      return res.status(400).json({
        success: false,
        message: "movieId, userId, rating are required"
      });
    }

    // 1️⃣ Save Review
    const newReview = await Review.create({
      movieId,
      userId,
      rating,
      text
    });

    // 2️⃣ Fetch all reviews for this movie
    const reviews = await Review.find({ movieId });

    // 3️⃣ Calculate average
    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) /
      reviews.length;

    // 4️⃣ Update Movie
    await Movie.findByIdAndUpdate(movieId, {
      avgRating: avg.toFixed(1),
      reviewCount: reviews.length
    });

    res.status(201).json({
      success: true,
      data: newReview
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
*/

const mongoose = require("mongoose");
const Review = require("../models/Review");
const Movie = require("../models/Movie");
const updateMovieRating = require("../utils/updateMovieRating");

const isValidRating = (rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5;

exports.addReview = async (req, res) => {
  try {
    const { movieId, userId, rating, text } = req.body;
    const numericRating = Number(rating);

    if (!movieId || !userId || rating === undefined) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "movieId, userId, and rating are required",
      });
    }

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid movieId",
      });
    }

    if (!isValidRating(numericRating)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Movie not found",
      });
    }

    const existingReview = await Review.findOne({ movieId, userId });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        data: null,
        message: "User has already reviewed this movie",
      });
    }

    const review = await Review.create({
      movieId,
      userId,
      rating: numericRating,
      text,
    });

    await updateMovieRating(movieId);

    return res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        data: null,
        message: "User has already reviewed this movie",
      });
    }

    return res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

exports.getReviewsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid movieId",
      });
    }

    const reviews = await Review.find({ movieId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, text } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid review id",
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Review not found",
      });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (!isValidRating(numericRating)) {
        return res.status(400).json({
          success: false,
          data: null,
          message: "Rating must be an integer between 1 and 5",
        });
      }

      review.rating = numericRating;
    }

    if (text !== undefined) {
      review.text = text;
    }

    await review.save();
    await updateMovieRating(review.movieId);

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid review id",
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Review not found",
      });
    }

    const movieId = review.movieId;

    await review.deleteOne();
    await updateMovieRating(movieId);

    return res.status(200).json({
      success: true,
      data: {
        message: "Review deleted successfully",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};
