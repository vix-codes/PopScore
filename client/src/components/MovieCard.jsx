import { Link } from "react-router-dom";
import StarRating from "./StarRating";

function MovieCard({ movie }) {
  return (
    <div className="card">
      <h3>{movie.title}</h3>
      <StarRating rating={movie.averageRating || movie.avgRating || movie.rating || 0} />
      <p>
        <Link to={`/movies/${movie.id}`}>View details</Link>
      </p>
    </div>
  );
}

export default MovieCard;
