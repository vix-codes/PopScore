import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PopcornScore } from '../components/PopcornRating.jsx';
import { PopMeter } from '../components/PopMeter.jsx';
import { PopKernelIcon } from '../components/PopKernelIcon.jsx';
import { ReviewList } from '../components/ReviewList.jsx';
import { ReviewForm } from '../components/ReviewForm.jsx';
import { DetailSkeleton } from '../components/Loader.jsx';
import { hasPoster, posterFallbackClass, posterSrc, usePosterFallback } from '../utils/poster.js';

function RatingBreakdown({ breakdown, total }) {
  if (!breakdown || !total) return null;
  const rows = [5, 4, 3, 2, 1];
  return (
    <div className="breakdown">
      <h3 className="bd-title">Rating breakdown</h3>
      {rows.map((n) => {
        const c = breakdown[n] || 0;
        const pct = total ? Math.round((c / total) * 100) : 0;
        return (
          <div key={n} className="bd-row">
            <span className="bd-label">
              {n}<PopKernelIcon size={14} />
            </span>
            <div className="bd-bar">
              <div className="bd-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="bd-count">{c}</span>
          </div>
        );
      })}
      <style>{`
        .breakdown {
          margin-top: 1.5rem;
          padding: 1.25rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--bg-elevated);
        }
        .bd-title {
          margin: 0 0 1rem;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .bd-row {
          display: grid;
          grid-template-columns: 52px 1fr 36px;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.45rem;
        }
        .bd-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          gap: 0.15rem;
        }
        .bd-bar {
          height: 8px;
          border-radius: 999px;
          background: var(--bg-card);
          overflow: hidden;
        }
        .bd-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          transition: width 0.4s ease;
        }
        .bd-count {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-align: right;
        }
      `}</style>
    </div>
  );
}

export function MovieDetails() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revLoading, setRevLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [err, setErr] = useState('');

  const loadMovie = async () => {
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.get(`/movies/${id}`);
      setMovie(data);
    } catch {
      setErr('Movie not found');
      setMovie(null);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    setRevLoading(true);
    try {
      const { data } = await api.get(`/reviews/${id}`);
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setRevLoading(false);
    }
  };

  useEffect(() => {
    loadMovie();
    loadReviews();
  }, [id]);

  const movieUpdated = () => loadMovie();

  const myReview = user ? reviews.find((r) => r.userId?.toString() === user.id?.toString()) : null;
  const isFav = user?.favorites?.map(String).includes(String(id));

  const toggleFav = async () => {
    if (!user) return;
    setFavBusy(true);
    try {
      await api.post(`/users/favorites/${id}`);
      await refreshUser();
    } finally {
      setFavBusy(false);
    }
  };

  const onCreateReview = async ({ rating, text }) => {
    setSubmitting(true);
    try {
      await api.post('/reviews', { movieId: id, rating, text });
      await loadReviews();
      await loadMovie();
    } catch (e) {
      alert(e.response?.data?.message || 'Could not post review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <DetailSkeleton />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="page">
        <div className="error-banner">{err || 'Not found'}</div>
      </div>
    );
  }

  const bd = movie.ratingBreakdown || {};
  const total = movie.reviewCount || 0;

  return (
    <div className="page movie-detail animate-in">
      <div className="detail-grid">
        <div className="poster-col">
          <div className={`poster-frame ${posterFallbackClass(movie)}`} data-poster-frame>
            {hasPoster(movie) && (
              <img
                src={posterSrc(movie)}
                alt=""
                className="hero-poster"
                onError={usePosterFallback}
              />
            )}
            <div className="detail-poster-fallback" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          {user && (
            <button type="button" className="btn fav-btn" onClick={toggleFav} disabled={favBusy}>
              {isFav ? 'Saved' : 'Save to favorites'}
            </button>
          )}
        </div>
        <div className="info-col">
          <h1 className="film-title">{movie.title}</h1>
          <p className="film-meta">
            {movie.year}
            {movie.genre?.length ? ` - ${movie.genre.join(' - ')}` : ''}
          </p>
          <div className="score-row">
            <PopcornScore value={movie.avgRating} reviewCount={movie.reviewCount} />
          </div>
          <PopMeter avgRating={movie.avgRating} reviewCount={movie.reviewCount} year={movie.year} />
          <p className="desc">{movie.description}</p>
          <RatingBreakdown breakdown={bd} total={total} />
        </div>
      </div>

      <section className="reviews-section">
        <h2 className="section-title">Community reviews</h2>
        {user && !myReview && (
          <div className="form-block">
            <h3 className="subh">Write your review</h3>
            <ReviewForm onSubmit={onCreateReview} disabled={submitting} />
          </div>
        )}
        {user && myReview && (
          <p className="hint muted">You reviewed this film - edit or delete from the list below.</p>
        )}
        {!user && <p className="hint muted">Log in to rate with popcorn and like reviews.</p>}
        <ReviewList
          movieId={id}
          reviews={reviews}
          loading={revLoading}
          onRefresh={loadReviews}
          movieUpdated={movieUpdated}
        />
      </section>

      <style>{`
        .movie-detail {
          padding-top: 1.5rem;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: minmax(220px, 300px) 1fr;
          gap: 2rem;
          align-items: start;
          margin-bottom: 2.5rem;
        }
        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
        .poster-col {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .poster-frame {
          position: relative;
          aspect-ratio: 2/3;
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);
          background: #101219;
        }
        .hero-poster {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }
        .detail-poster-fallback {
          position: absolute;
          inset: 0;
          display: none;
          grid-template-rows: 1.2fr 0.7fr 1fr 0.55fr;
          gap: 0.85rem;
          padding: 1.5rem;
          background:
            linear-gradient(160deg, rgba(255, 107, 53, 0.18), transparent 42%),
            linear-gradient(20deg, transparent 45%, rgba(247, 201, 72, 0.12), transparent 70%),
            #101219;
        }
        .detail-poster-fallback span {
          border-radius: 8px;
          background:
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.12) 0 12px,
              transparent 12px 20px
            ),
            rgba(255, 255, 255, 0.06);
          opacity: 0.8;
        }
        .detail-poster-fallback span:nth-child(2) {
          width: 76%;
          justify-self: end;
          opacity: 0.55;
        }
        .detail-poster-fallback span:nth-child(3) {
          width: 88%;
          align-self: end;
          opacity: 0.7;
        }
        .detail-poster-fallback span:nth-child(4) {
          width: 58%;
          opacity: 0.5;
        }
        .poster-fallback-active .detail-poster-fallback {
          display: grid;
        }
        .fav-btn {
          width: 100%;
        }
        .film-title {
          font-family: var(--font-display);
          font-size: clamp(1.75rem, 3vw, 2.35rem);
          font-weight: 800;
          margin: 0 0 0.5rem;
          letter-spacing: -0.02em;
        }
        .film-meta {
          color: var(--text-muted);
          margin: 0 0 1rem;
        }
        .score-row {
          margin-bottom: 1.25rem;
        }
        .desc {
          line-height: 1.65;
          color: var(--text-muted);
          margin: 0;
        }
        .reviews-section {
          border-top: 1px solid var(--border);
          padding-top: 2rem;
        }
        .form-block {
          margin-bottom: 1.5rem;
        }
        .subh {
          margin: 0 0 0.75rem;
          font-size: 1rem;
        }
        .hint {
          margin: 0 0 1rem;
        }
      `}</style>
    </div>
  );
}
