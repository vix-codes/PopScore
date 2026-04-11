import { useEffect, useState } from 'react';

export function SearchBar({ value, onChange, placeholder = 'Search movies…' }) {
  const [local, setLocal] = useState(value || '');

  useEffect(() => {
    setLocal(value || '');
  }, [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 350);
    return () => clearTimeout(t);
  }, [local]);

  return (
    <div className="search-bar">
      <span className="search-icon" aria-hidden>
        🔍
      </span>
      <input
        className="input search-input"
        type="search"
        placeholder={placeholder}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        autoComplete="off"
      />
      <style>{`
        .search-bar {
          position: relative;
          flex: 1;
          min-width: 200px;
          max-width: 420px;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.5;
          font-size: 0.9rem;
          pointer-events: none;
        }
        .search-input {
          padding-left: 2.75rem;
        }
      `}</style>
    </div>
  );
}
