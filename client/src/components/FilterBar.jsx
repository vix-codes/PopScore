const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Music',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
  'Western',
];

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Rating (high)' },
  { value: 'rating_asc', label: 'Rating (low)' },
  { value: 'year', label: 'Year (new)' },
  { value: 'year_asc', label: 'Year (old)' },
];

export function FilterBar({ selectedGenres, onGenresChange, sort, onSortChange }) {
  const toggle = (g) => {
    if (selectedGenres.includes(g)) {
      onGenresChange(selectedGenres.filter((x) => x !== g));
    } else {
      onGenresChange([...selectedGenres, g]);
    }
  };

  return (
    <div className="filter-bar">
      <div className="filter-genres">
        <span className="filter-label">Genres</span>
        <div className="genre-chips">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              className={`chip ${selectedGenres.includes(g) ? 'on' : ''}`}
              onClick={() => toggle(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-sort">
        <label className="filter-label" htmlFor="sort-select">
          Sort
        </label>
        <select
          id="sort-select"
          className="input sort-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <style>{`
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          align-items: flex-end;
          margin-bottom: 1.5rem;
        }
        .filter-genres {
          flex: 1;
          min-width: 280px;
        }
        .filter-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .genre-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .chip {
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .chip.on {
          background: rgba(255, 107, 53, 0.2);
          border-color: rgba(255, 107, 53, 0.5);
          color: var(--text);
        }
        .chip:not(.on):hover {
          border-color: rgba(255, 255, 255, 0.2);
          color: var(--text);
        }
        .filter-sort {
          min-width: 200px;
        }
        .sort-select {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
