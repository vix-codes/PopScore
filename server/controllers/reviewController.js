const { reviews } = require("../data/dummyData");

function getReviewsByMovieId(req, res) {
  const movieReviews = reviews.filter((item) => item.movieId === req.params.movieId);
  res.json(movieReviews);
}

function createReview(req, res) {
  const { movieId, author, comment, rating } = req.body;

  if (!movieId || !author || !comment || !rating) {
    return res.status(400).json({ message: "movieId, author, comment and rating are required" });
  }

  const newReview = {
    id: String(Date.now()),
    movieId,
    author,
    comment,
    rating: Number(rating)
  };

  reviews.push(newReview);

  return res.status(201).json(newReview);
}

module.exports = { getReviewsByMovieId, createReview };
