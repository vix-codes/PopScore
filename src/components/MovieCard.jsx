import { useNavigate } from "react-router-dom";

const STAR = "\u2605";

function MovieCard({ movie }) {
  const navigate = useNavigate();

  return (
    <article
      className="movie-card"
      onClick={() => navigate(`/movies/${movie._id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          navigate(`/movies/${movie._id}`);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="movie-poster-wrap">
        <img className="movie-poster" src={movie.posterUrl} alt={movie.title} />
      </div>

      <div className="movie-card-body">
        <div className="movie-card-topline">
          <span className="genre-chip">{movie.genre}</span>
          <span className="movie-year">{movie.year}</span>
        </div>

        <h3>{movie.title}</h3>
        <p className="movie-description">{movie.description}</p>

        <div className="rating-row">
          <span className="rating-value">
            {STAR} {movie.avgRating}
          </span>
          <span className="review-count">{movie.reviewCount} reviews</span>
        </div>
      </div>
    </article>
  );
}

export default MovieCard;
