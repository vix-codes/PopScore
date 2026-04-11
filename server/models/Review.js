const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "userId is required"],
      trim: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "movieId is required"],
    },
    rating: {
      type: Number,
      required: [true, "rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5",
      },
    },
    text: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Review text cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ movieId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
