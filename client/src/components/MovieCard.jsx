import { Link } from 'react-router-dom';
import { PopcornRating } from './PopcornRating.jsx';
import { PopMeter } from './PopMeter.jsx';
import { hasPoster, posterFallbackClass, posterSrc, usePosterFallback } from '../utils/poster.js';

export function MovieCard({ movie }) {
  const id = movie._id;
  const rounded = Math.round(Number(movie.avgRating) || 0);

  return (
    <Link to={`/movie/${id}`} className="movie-card-link animate-in">
      <article className="card movie-card">
        <div className={`poster-wrap ${posterFallbackClass(movie)}`} data-poster-frame>
          {hasPoster(movie) && (
            <img
              src={posterSrc(movie)}
              alt=""
              className="poster"
              loading="lazy"
              onError={usePosterFallback}
            />
          )}
          <div className="poster-fallback" aria-hidden="true">
            <span>{movie.title}</span>
            <small>Poster unavailable</small>
          </div>
          <div className="poster-shine" />
        </div>
        <div className="movie-card-body">
          <h3 className="movie-title">{movie.title}</h3>
          <p className="movie-meta">
            {movie.year}
            {movie.genre?.length ? ` · ${movie.genre.slice(0, 2).join(', ')}` : ''}
          </p>
          <div className="movie-rating-row">
            <PopcornRating value={rounded} readOnly size="sm" />
            <span className="avg-num">{(Number(movie.avgRating) || 0).toFixed(1)}</span>
          </div>
          <PopMeter
            avgRating={movie.avgRating}
            reviewCount={movie.reviewCount}
            year={movie.year}
            compact
          />
        </div>
      </article>
      <style>{`
        .movie-card-link {
          color: inherit;
          display: block;
        }
        .movie-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .poster-wrap {
          position: relative;
          overflow: hidden;
          aspect-ratio: 2/3;
          background: #101219;
        }
        .poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .poster-fallback {
          position: absolute;
          inset: 0;
          display: none;
          place-items: center;
          align-content: center;
          gap: 0.7rem;
          padding: 1.25rem;
          text-align: center;
          background:
            linear-gradient(160deg, rgba(255, 107, 53, 0.16), transparent 48%),
            #101219;
          color: var(--text);
        }
        .poster-fallback span {
          font-family: var(--font-display);
          font-size: clamp(1rem, 1.8vw, 1.45rem);
          font-weight: 800;
          line-height: 1.15;
        }
        .poster-fallback small {
          color: var(--accent-2);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .poster-fallback-active .poster-fallback {
          display: grid;
        }
        .movie-card:hover .poster {
          transform: scale(1.06);
        }
        .poster-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 40%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 60%
          );
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        .movie-card:hover .poster-shine {
          transform: translateX(100%);
        }
        .movie-card-body {
          padding: 1rem 1.1rem 1.15rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .movie-title {
          margin: 0 0 0.35rem;
          font-size: 1.05rem;
          font-weight: 700;
          font-family: var(--font-display);
          letter-spacing: -0.02em;
          line-height: 1.25;
        }
        .movie-meta {
          margin: 0 0 0.65rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .movie-rating-row {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .avg-num {
          font-weight: 700;
          color: var(--accent-2);
          font-size: 0.9rem;
        }
      `}</style>
    </Link>
  );
}
