function roundToSingleDecimal(value) {
  return Math.round(value * 10) / 10;
}

function enrichMovie(movie, reviews) {
  const movieReviews = reviews.filter((review) => review.movieId === movie.id);
  const averageRating = movieReviews.length
    ? roundToSingleDecimal(movieReviews.reduce((sum, review) => sum + Number(review.rating), 0) / movieReviews.length)
    : 0;
  const audienceScore = movieReviews.length
    ? Math.round((movieReviews.filter((review) => Number(review.rating) >= 4).length / movieReviews.length) * 100)
    : 0;

  return {
    ...movie,
    reviewCount: movieReviews.length,
    averageRating,
    audienceScore
  };
}

function sortMovies(movies, sortBy) {
  const list = [...movies];

  switch (sortBy) {
    case "lowest":
      return list.sort((a, b) => a.averageRating - b.averageRating);
    case "newest":
      return list.sort((a, b) => b.year - a.year);
    case "oldest":
      return list.sort((a, b) => a.year - b.year);
    case "title":
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case "highest":
    default:
      return list.sort((a, b) => b.averageRating - a.averageRating || b.criticScore - a.criticScore);
  }
}

function getCatalogStats(movies) {
  const totalReviews = movies.reduce((sum, movie) => sum + movie.reviewCount, 0);
  const averageAudience = movies.length
    ? Math.round(movies.reduce((sum, movie) => sum + movie.audienceScore, 0) / movies.length)
    : 0;

  return {
    movieCount: movies.length,
    reviewCount: totalReviews,
    averageAudienceScore: averageAudience
  };
}

module.exports = { enrichMovie, sortMovies, getCatalogStats };
