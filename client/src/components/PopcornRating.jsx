export function PopcornRating({
  value,
  onChange,
  max = 5,
  readOnly = false,
  size = 'md',
}) {
  const sizes = { sm: '1.15rem', md: '1.5rem', lg: '2rem' };
  const fontSize = sizes[size] || sizes.md;

  return (
    <div
      className={`popcorn-rating ${readOnly ? 'readonly' : ''}`}
      role={readOnly ? 'img' : 'group'}
      aria-label={readOnly ? `${value} out of ${max} popcorn` : 'Select popcorn rating'}
    >
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1;
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            className={`pop ${active ? 'active' : ''}`}
            onClick={() => onChange?.(n)}
            aria-pressed={active}
            aria-label={`${n} popcorn`}
          >
            🍿
          </button>
        );
      })}
      <style>{`
        .popcorn-rating {
          display: inline-flex;
          gap: 0.15rem;
          align-items: center;
        }
        .popcorn-rating.readonly .pop {
          cursor: default;
        }
        .pop {
          background: none;
          border: none;
          padding: 0.1rem;
          font-size: ${fontSize};
          line-height: 1;
          filter: grayscale(1) brightness(0.55);
          opacity: 0.45;
          transition: transform 0.15s ease, filter 0.2s, opacity 0.2s;
        }
        .pop:not(:disabled):hover {
          transform: scale(1.12);
        }
        .pop.active {
          filter: none;
          opacity: 1;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

export function PopcornScore({ value, reviewCount }) {
  const v = Number(value) || 0;
  return (
    <span className="pop-score">
      <PopcornRating value={Math.round(v)} readOnly size="sm" />
      <span className="pop-num">{v.toFixed(1)}</span>
      {reviewCount != null && <span className="pop-rc">({reviewCount} reviews)</span>}
      <style>{`
        .pop-score {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }
        .pop-num {
          font-weight: 700;
          color: var(--accent-2);
          font-size: 0.95rem;
        }
        .pop-rc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
    </span>
  );
}
