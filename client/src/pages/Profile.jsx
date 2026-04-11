import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PopcornRating } from '../components/PopcornRating.jsx';
import { Loader } from '../components/Loader.jsx';
import { PopKernelCluster } from '../components/PopKernelIcon.jsx';
import { hasPoster, hasRealPoster, posterFallbackClass, posterSrc, usePosterFallback } from '../utils/poster.js';

function SentimentBadge({ sentiment }) {
  const map = {
    positive: 'pos',
    neutral: 'neu',
    negative: 'neg',
  };
  const c = map[sentiment] || 'neu';
  return <span className={`sb ${c}`}>{sentiment}</span>;
}

export function Profile() {
  const { user, refreshUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/users/reviews');
        setReviews(data.filter((review) => hasRealPoster(review.movieId)));
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page profile-page animate-in">
      <h1 className="section-title">Your profile</h1>
      <div className="profile-card card">
        <div className="avatar"><PopKernelCluster count={3} size={24} /></div>
        <div>
          <h2 className="uname">{user?.username}</h2>
          <p className="email">{user?.email}</p>
          <span className="role-pill">{user?.role}</span>
        </div>
      </div>

      <h2 className="section-title sub">Your reviews</h2>
      {loading ? (
        <Loader />
      ) : reviews.length ? (
        <ul className="rev-grid">
          {reviews.map((r) => (
            <li key={r._id} className="card pr-card">
              <Link to={`/movie/${r.movieId?._id || r.movieId}`} className="pr-movie">
                <span className={`pr-poster-frame ${posterFallbackClass(r.movieId)}`} data-poster-frame>
                  {hasPoster(r.movieId) && (
                    <img
                      src={posterSrc(r.movieId)}
                      alt=""
                      className="pr-poster"
                      onError={usePosterFallback}
                    />
                  )}
                  <span className="pr-poster-fallback" aria-hidden="true" />
                </span>
                <div>
                  <strong>{r.movieId?.title || 'Movie'}</strong>
                  <span className="pr-year">{r.movieId?.year}</span>
                </div>
              </Link>
              <div className="pr-row">
                <PopcornRating value={r.rating} readOnly size="sm" />
                <SentimentBadge sentiment={r.sentiment} />
              </div>
              {r.text && <p className="pr-text">{r.text}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">You have not reviewed any movies yet.</p>
      )}

      <style>{`
        .profile-page .profile-card {
          display: flex;
          gap: 1.25rem;
          align-items: center;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .profile-card:hover {
          transform: none;
        }
        .avatar {
          width: 72px;
          height: 72px;
          border-radius: 16px;
          background: var(--bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: var(--accent-2);
        }
        .uname {
          margin: 0 0 0.25rem;
          font-size: 1.35rem;
        }
        .email {
          margin: 0 0 0.5rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .role-pill {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          background: rgba(247, 201, 72, 0.15);
          color: var(--accent-2);
        }
        .section-title.sub {
          font-size: 1.35rem;
          margin-top: 0;
        }
        .rev-grid {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .pr-card {
          padding: 1rem 1.15rem;
        }
        .pr-card:hover {
          transform: none;
        }
        .pr-movie {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 0.5rem;
          color: inherit;
        }
        .pr-poster {
          width: 48px;
          height: 72px;
          object-fit: cover;
          display: block;
        }
        .pr-poster-frame {
          position: relative;
          width: 48px;
          height: 72px;
          border-radius: 6px;
          overflow: hidden;
          flex: 0 0 auto;
          background: #101219;
        }
        .pr-poster-fallback {
          position: absolute;
          inset: 0;
          display: none;
          background:
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.12) 0 8px,
              transparent 8px 13px
            ),
            linear-gradient(160deg, rgba(255, 107, 53, 0.18), transparent 48%),
            #101219;
        }
        .poster-fallback-active .pr-poster-fallback {
          display: grid;
        }
        .pr-year {
          display: block;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }
        .pr-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }
        .pr-text {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .sb {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }
        .sb.pos {
          background: rgba(61, 214, 140, 0.15);
          color: var(--positive);
        }
        .sb.neu {
          background: rgba(154, 163, 184, 0.15);
          color: var(--neutral);
        }
        .sb.neg {
          background: rgba(255, 107, 107, 0.15);
          color: var(--negative);
        }
        .muted {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
