import { useState } from 'react';
import api from '../api/client.js';
import { PopcornRating } from './PopcornRating.jsx';
import { ReviewForm } from './ReviewForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function SentimentBadge({ sentiment }) {
  const map = {
    positive: { label: 'Positive', className: 'pos' },
    neutral: { label: 'Neutral', className: 'neu' },
    negative: { label: 'Negative', className: 'neg' },
  };
  const s = map[sentiment] || map.neutral;
  return (
    <span className={`sentiment ${s.className}`}>{s.label}</span>
  );
}

export function ReviewList({
  movieId,
  reviews,
  loading,
  onRefresh,
  movieUpdated,
}) {
  const { user } = useAuth();
  const [liking, setLiking] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [expanded, setExpanded] = useState({});

  const handleLike = async (reviewId) => {
    if (!user) return;
    setLiking((m) => ({ ...m, [reviewId]: true }));
    try {
      await api.post(`/reviews/${reviewId}/like`);
      onRefresh?.();
    } catch {
      /* toast optional */
    } finally {
      setLiking((m) => ({ ...m, [reviewId]: false }));
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    setDeleting(reviewId);
    try {
      await api.delete(`/reviews/${reviewId}`);
      await onRefresh?.();
      movieUpdated?.();
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <p className="muted">Loading reviews…</p>;
  }

  if (!reviews?.length) {
    return <p className="muted">No reviews yet. Be the first with your 🍿 take!</p>;
  }

  return (
    <ul className="review-list">
      {reviews.map((r) => {
        const mine = user && r.userId?.toString() === user.id?.toString();
        const isEditing = editingId === r._id;

        return (
          <li key={r._id} className="review-item card">
            <div className="review-head">
              <div>
                <strong className="rev-user">{r.username || 'User'}</strong>
                <SentimentBadge sentiment={r.sentiment} />
              </div>
              <time className="rev-time">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
              </time>
            </div>
            {!isEditing && (
              <>
                <div className="rev-rating-row">
                  <PopcornRating value={r.rating} readOnly size="sm" />
                </div>
                {r.summary && <p className="rev-summary">{r.summary}</p>}
                {r.text && expanded[r._id] && <p className="rev-text">{r.text}</p>}
                <div className="rev-actions">
                  {r.text && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setExpanded((current) => ({ ...current, [r._id]: !current[r._id] }))}
                    >
                      {expanded[r._id] ? 'Hide full review' : 'Read full review'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost like-btn"
                    onClick={() => handleLike(r._id)}
                    disabled={!user || liking[r._id]}
                  >
                    👍 {r.likes ?? 0}
                  </button>
                  {mine && (
                    <>
                      <button type="button" className="btn btn-ghost" onClick={() => setEditingId(r._id)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleDelete(r._id)}
                        disabled={deleting === r._id}
                      >
                        {deleting === r._id ? '…' : 'Delete'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
            {isEditing && (
              <div className="edit-wrap">
                <ReviewForm
                  key={r._id}
                  initialRating={r.rating}
                  initialText={r.text}
                  submitLabel="Update review"
                  disabled={liking[`e-${r._id}`]}
                  onSubmit={async ({ rating, text }) => {
                    setLiking((m) => ({ ...m, [`e-${r._id}`]: true }));
                    try {
                      await api.put(`/reviews/${r._id}`, { rating, text });
                      setEditingId(null);
                      await onRefresh?.();
                      movieUpdated?.();
                    } finally {
                      setLiking((m) => ({ ...m, [`e-${r._id}`]: false }));
                    }
                  }}
                />
                <button type="button" className="btn btn-ghost cancel-edit" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            )}
          </li>
        );
      })}
      <style>{`
        .review-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .review-item {
          padding: 1.1rem 1.25rem;
        }
        .review-item:hover {
          transform: none;
        }
        .review-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .review-head > div:first-child {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .rev-user {
          font-size: 0.95rem;
        }
        .rev-time {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .sentiment {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }
        .sentiment.pos {
          background: rgba(61, 214, 140, 0.15);
          color: var(--positive);
        }
        .sentiment.neu {
          background: rgba(154, 163, 184, 0.15);
          color: var(--neutral);
        }
        .sentiment.neg {
          background: rgba(255, 107, 107, 0.15);
          color: var(--negative);
        }
        .rev-rating-row {
          margin-bottom: 0.5rem;
        }
        .rev-text {
          margin: 0 0 0.75rem;
          line-height: 1.55;
          color: var(--text);
          font-size: 0.95rem;
        }
        .rev-summary {
          margin: 0 0 0.75rem;
          line-height: 1.55;
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        .rev-actions {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
        }
        .like-btn {
          font-size: 0.9rem;
        }
        .edit-wrap {
          margin-top: 0.5rem;
        }
        .cancel-edit {
          margin-top: 0.5rem;
        }
        .muted {
          color: var(--text-muted);
        }
      `}</style>
    </ul>
  );
}
