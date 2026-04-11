import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ReviewList from "../components/ReviewList";

const STAR = "\u2605";
const LEFT_ARROW = "\u2190";

const dummyMovieMap = {
  "1": {
    _id: "1",
    title: "Inception",
    genre: "Sci-Fi",
    year: 2010,
    duration: 148,
    posterUrl:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=80",
    avgRating: 4.7,
    reviewCount: 128,
    description:
      "A thief who steals corporate secrets through dream-sharing technology is given a final mission that may cost him everything.",
  },
  "2": {
    _id: "2",
    title: "The Dark Knight",
    genre: "Action",
    year: 2008,
    duration: 152,
    posterUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
    avgRating: 4.9,
    reviewCount: 204,
    description:
      "Batman faces the Joker in a crime epic about order, fear, and the price of heroism in Gotham.",
  },
  "3": {
    _id: "3",
    title: "Interstellar",
    genre: "Drama",
    year: 2014,
    duration: 169,
    posterUrl:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80",
    avgRating: 4.8,
    reviewCount: 187,
    description:
      "A team of explorers travels through a wormhole in space to secure humanity's survival.",
  },
};

const dummyReviewsMap = {
  "1": [
    {
      _id: "r1",
      userName: "Sarah J.",
      rating: 5,
      text: "Mind-bending and brilliant. The layers of the story unfold in a way that rewards every rewatch.",
      createdAt: "2026-04-08T10:00:00.000Z",
      helpful: 23,
    },
    {
      _id: "r2",
      userName: "David R.",
      rating: 4,
      text: "Complex and emotional. The ending kept me thinking long after the credits rolled.",
      createdAt: "2026-04-09T14:30:00.000Z",
      helpful: 15,
    },
    {
      _id: "r3",
      userName: "Mike T.",
      rating: 4,
      text: "A bit confusing at first, but the visuals and pacing make it worth the attention.",
      createdAt: "2026-04-10T09:10:00.000Z",
      helpful: 9,
    },
  ],
  "2": [
    {
      _id: "r4",
      userName: "Rahul",
      rating: 5,
      text: "Still one of the strongest superhero films ever made. The tension never drops.",
      createdAt: "2026-04-07T19:45:00.000Z",
      helpful: 18,
    },
  ],
  "3": [],
};

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    const loadMovieData = async () => {
      try {
        const [movieResponse, reviewsResponse] = await Promise.all([
          axios.get(`/api/movies/${id}`),
          axios.get(`/api/reviews/${id}`),
        ]);

        setMovie(movieResponse.data);
        setReviews(reviewsResponse.data);
      } catch (error) {
        setMovie(dummyMovieMap[id] || null);
        setReviews(dummyReviewsMap[id] || []);
      } finally {
        setLoading(false);
      }
    };

    loadMovieData();
  }, [id]);

  const sortedReviews = useMemo(() => {
    const cloned = [...reviews];

    cloned.sort((first, second) => {
      if (sortBy === "highest") {
        return second.rating - first.rating;
      }

      if (sortBy === "oldest") {
        return new Date(first.createdAt) - new Date(second.createdAt);
      }

      return new Date(second.createdAt) - new Date(first.createdAt);
    });

    return cloned;
  }, [reviews, sortBy]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="status-panel">Loading movie details...</div>
      </main>
    );
  }

  if (!movie) {
    return (
      <main className="page-shell">
        <Link className="page-link" to="/">
          {LEFT_ARROW} Back to catalog
        </Link>
        <div className="status-panel">Movie not found.</div>
      </main>
    );
  }

  return (
    <main className="page-shell detail-page">
      <div className="detail-breadcrumb">
        <Link className="page-link" to="/">
          {LEFT_ARROW} Home
        </Link>
        <span>/</span>
        <span>Movies</span>
        <span>/</span>
        <span>{movie.title}</span>
      </div>

      <section className="detail-layout">
        <img className="detail-poster" src={movie.posterUrl} alt={movie.title} />

        <div className="detail-copy">
          <p className="eyebrow">Movie Spotlight</p>
          <h1>{movie.title}</h1>

          <div className="detail-meta">
            <span className="meta-pill">{movie.year}</span>
            <span className="meta-pill">{movie.genre}</span>
            <span className="meta-pill">{movie.duration || 148} min</span>
          </div>

          <div className="hero-score">
            <span className="big-rating">
              {movie.avgRating} {STAR}
            </span>
            <p>Audience rating from {movie.reviewCount} reviews</p>
          </div>

          <p className="meta-text">
            {movie.description ||
              "Full description will appear here once the backend sends the movie record."}
          </p>

          <div className="summary-band">
            <div className="summary-card">
              <span>{movie.avgRating}</span>
              <p>Average rating</p>
            </div>
            <div className="summary-card">
              <span>{movie.reviewCount}</span>
              <p>Total reviews</p>
            </div>
            <div className="summary-card">
              <span>#12</span>
              <p>Top rated this week</p>
            </div>
          </div>
        </div>
      </section>

      <section className="review-composer">
        <div className="review-composer-head">
          <div>
            <p className="eyebrow">Write a Review</p>
            <h2>Share your take on this movie</h2>
          </div>
          <div className="rating-picker">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={
                  value <= ratingInput ? "star-button active" : "star-button"
                }
                onClick={() => setRatingInput(value)}
              >
                {STAR}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="review-textarea"
          rows="4"
          placeholder="Share your thoughts about this movie..."
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
        />

        <div className="composer-actions">
          <button className="primary-btn" type="button">
            Submit Review
          </button>
          <p className="helper-text">Frontend preview only. Backend submit comes next.</p>
        </div>
      </section>

      <ReviewList reviews={sortedReviews} sortBy={sortBy} onSortChange={setSortBy} />
    </main>
  );
}

export default MovieDetail;
