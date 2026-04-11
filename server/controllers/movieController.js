const { readStore, updateStore } = require("../data/store");
const { enrichMovie, sortMovies, getCatalogStats } = require("../utils/movieUtils");

function listMovies(req, res) {
  const { q = "", genre = "All", sort = "highest" } = req.query;
  const { movies, reviews } = readStore();
  const enrichedMovies = movies.map((movie) => enrichMovie(movie, reviews));

  const filtered = enrichedMovies.filter((movie) => {
    const searchMatch = movie.title.toLowerCase().includes(String(q).trim().toLowerCase());
    const genreMatch = genre === "All" || movie.genres.includes(genre);
    return searchMatch && genreMatch;
  });

  const sorted = sortMovies(filtered, sort);
  const availableGenres = ["All", ...new Set(movies.flatMap((movie) => movie.genres))];

  return res.json({
    movies: sorted,
    availableGenres,
    stats: getCatalogStats(enrichedMovies)
  });
}

function getMovieById(req, res) {
  const { movies, reviews } = readStore();
  const movie = movies.find((item) => item.id === req.params.id);

  if (!movie) {
    return res.status(404).json({ message: "Movie not found." });
  }

  const enrichedMovie = enrichMovie(movie, reviews);
  const movieReviews = reviews
    .filter((review) => review.movieId === movie.id)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const relatedMovies = movies
    .filter((item) => item.id !== movie.id && item.genres.some((genre) => movie.genres.includes(genre)))
    .slice(0, 3)
    .map((item) => enrichMovie(item, reviews));

  return res.json({ movie: enrichedMovie, reviews: movieReviews, relatedMovies });
}

function createMovie(req, res) {
  const {
    title,
    year,
    duration,
    genres,
    director,
    cast,
    language,
    country,
    description,
    longSynopsis,
    criticScore,
    featuredQuote,
    status,
    palette,
    backdropPalette
  } = req.body;

  if (!title || !year || !duration || !genres || !director || !description || !criticScore) {
    return res.status(400).json({ message: "Title, year, duration, genres, director, description, and criticScore are required." });
  }

  const movieId = `movie-${String(title).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
  const newMovie = {
    id: movieId,
    title: String(title).trim(),
    year: Number(year),
    releaseDate: req.body.releaseDate || `${year}-01-01`,
    duration: Number(duration),
    genres: Array.isArray(genres) ? genres : String(genres).split(",").map((item) => item.trim()).filter(Boolean),
    director: String(director).trim(),
    cast: Array.isArray(cast) ? cast : String(cast || "").split(",").map((item) => item.trim()).filter(Boolean),
    language: language || "English",
    country: country || "Unknown",
    description: String(description).trim(),
    longSynopsis: String(longSynopsis || description).trim(),
    criticScore: Number(criticScore),
    featuredQuote: featuredQuote || "A new title added by the PopScore team.",
    status: status || "Now Showing",
    palette: Array.isArray(palette) && palette.length === 2 ? palette : ["#2f6fed", "#0c1830"],
    backdropPalette: Array.isArray(backdropPalette) && backdropPalette.length === 2 ? backdropPalette : ["#7fb7ff", "#0f203e"]
  };

  updateStore((store) => ({
    ...store,
    movies: [newMovie, ...store.movies]
  }));

  return res.status(201).json({ movie: newMovie });
}

function updateMovie(req, res) {
  const { movies } = readStore();
  const existingMovie = movies.find((movie) => movie.id === req.params.id);

  if (!existingMovie) {
    return res.status(404).json({ message: "Movie not found." });
  }

  let updatedMovie;
  updateStore((store) => {
    const nextMovies = store.movies.map((movie) => {
      if (movie.id !== req.params.id) {
        return movie;
      }

      updatedMovie = {
        ...movie,
        ...req.body,
        year: req.body.year ? Number(req.body.year) : movie.year,
        duration: req.body.duration ? Number(req.body.duration) : movie.duration,
        criticScore: req.body.criticScore ? Number(req.body.criticScore) : movie.criticScore,
        genres: req.body.genres
          ? Array.isArray(req.body.genres)
            ? req.body.genres
            : String(req.body.genres).split(",").map((item) => item.trim()).filter(Boolean)
          : movie.genres,
        cast: req.body.cast
          ? Array.isArray(req.body.cast)
            ? req.body.cast
            : String(req.body.cast).split(",").map((item) => item.trim()).filter(Boolean)
          : movie.cast
      };

      return updatedMovie;
    });

    return { ...store, movies: nextMovies };
  });

  return res.json({ movie: updatedMovie });
}

function deleteMovie(req, res) {
  const { movies } = readStore();
  const existingMovie = movies.find((movie) => movie.id === req.params.id);

  if (!existingMovie) {
    return res.status(404).json({ message: "Movie not found." });
  }

  updateStore((store) => ({
    ...store,
    movies: store.movies.filter((movie) => movie.id !== req.params.id),
    reviews: store.reviews.filter((review) => review.movieId !== req.params.id)
  }));

  return res.json({ message: "Movie deleted successfully." });
}

module.exports = { listMovies, getMovieById, createMovie, updateMovie, deleteMovie };
