const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    avgRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    strict: false,
    collection: "movies",
  }
);

module.exports = mongoose.model("Movie", movieSchema);
