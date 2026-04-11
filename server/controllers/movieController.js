const { movies } = require("../data/dummyData");

function getMovies(req, res) {
  res.json(movies);
}

function getMovieById(req, res) {
  const movie = movies.find((item) => item.id === req.params.id);

  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }

  return res.json(movie);
}

module.exports = { getMovies, getMovieById };
