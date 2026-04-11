import { useState } from 'react';
import { PopcornRating } from './PopcornRating.jsx';

export function ReviewForm({
  initialRating = 5,
  initialText = '',
  onSubmit,
  submitLabel = 'Post review',
  disabled = false,
}) {
  const [rating, setRating] = useState(initialRating);
  const [text, setText] = useState(initialText);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ rating, text });
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <label className="label">Your popcorn rating</label>
      <div className="mb">
        <PopcornRating value={rating} onChange={setRating} size="lg" />
      </div>
      <label className="label" htmlFor="rev-text">
        Review (optional)
      </label>
      <textarea
        id="rev-text"
        className="input review-text"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What did you think?"
        maxLength={2000}
      />
      <button type="submit" className="btn btn-primary" disabled={disabled}>
        {disabled ? 'Saving…' : submitLabel}
      </button>
      <style>{`
        .review-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1.25rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--bg-elevated);
        }
        .mb {
          margin-bottom: 0.5rem;
        }
        .review-text {
          resize: vertical;
          min-height: 100px;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </form>
  );
}
