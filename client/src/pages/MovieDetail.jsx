import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReviewList from "../components/ReviewList";
import StarRating from "../components/StarRating";
import { getMovieById, getReviewsByMovieId } from "../services/api";

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [movieData, reviewData] = await Promise.all([getMovieById(id), getReviewsByMovieId(id)]);
        setMovie(movieData);
        setReviews(reviewData);
      } catch (err) {
        setError("Failed to load movie details.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) return <p>Loading movie details...</p>;
  if (error) return <p>{error}</p>;
  if (!movie) return <p>Movie not found.</p>;

  return (
    <div>
      <h2>{movie.title}</h2>
      <StarRating rating={movie.rating} />
      <p>{movie.description}</p>
      <h3>Reviews</h3>
      <ReviewList reviews={reviews} />
    </div>
  );
}

export default MovieDetail;
