/**
 * Popmeter: average rating (1–5) as % of max, tiered as burnt / plain / golden.
 * Works for any movie from API data; upcoming = release year > current calendar year.
 */
export function computePopmeter(avgRating, reviewCount, year) {
  const nowYear = new Date().getFullYear();
  const y = year != null ? Number(year) : NaN;
  const upcoming = Number.isFinite(y) && y > nowYear;
  const count = Math.max(0, Number(reviewCount) || 0);
  const avg = Math.min(5, Math.max(0, Number(avgRating) || 0));

  if (count === 0) {
    return {
      percentage: 0,
      tier: 'unrated',
      label: 'No popmeter yet',
      shortLabel: 'Unrated',
      icon: '📽️',
      iconSecondary: null,
      upcoming,
      count,
    };
  }

  const percentage = Math.round((avg / 5) * 100);
  if (percentage >= 70) {
    return {
      percentage,
      tier: 'golden',
      label: 'Golden popcorn',
      shortLabel: 'Golden',
      icon: '✨',
      iconSecondary: '🍿',
      upcoming,
      count,
    };
  }
  if (percentage >= 40) {
    return {
      percentage,
      tier: 'plain',
      label: 'Plain popcorn',
      shortLabel: 'Plain',
      icon: '🍿',
      iconSecondary: null,
      upcoming,
      count,
    };
  }
  return {
    percentage,
    tier: 'burnt',
    label: 'Burnt popcorn',
    shortLabel: 'Burnt',
    icon: '🔥',
    iconSecondary: '🍿',
    upcoming,
    count,
  };
}

export function PopMeter({ avgRating, reviewCount, year, compact = false }) {
  const s = computePopmeter(avgRating, reviewCount, year);

  const hint =
    s.count === 0
      ? s.upcoming
        ? 'Upcoming title — meter fills as reviews arrive'
        : 'Average of all 🍿 reviews (0% until first review)'
      : `Average ${(Math.round((Number(avgRating) || 0) * 10) / 10).toFixed(1)} / 5 across ${s.count} review${s.count === 1 ? '' : 's'}`;

  return (
    <div
      className={`popmeter popmeter--${s.tier} ${compact ? 'popmeter--compact' : ''}`}
      role="meter"
      aria-label={`Popmeter ${s.percentage} percent, ${s.label}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={s.count ? s.percentage : 0}
    >
      <div className="popmeter-top">
        <div className="popmeter-icons" aria-hidden>
          <span className="popmeter-icon-main">{s.icon}</span>
          {s.iconSecondary ? <span className="popmeter-icon-sub">{s.iconSecondary}</span> : null}
        </div>
        <div className="popmeter-text">
          <span className="popmeter-name">Popmeter</span>
          <span className="popmeter-tier">{s.label}</span>
        </div>
        <div className="popmeter-pct-wrap">
          {s.upcoming ? <span className="popmeter-soon">Upcoming</span> : null}
          <span className="popmeter-pct">{s.count ? `${s.percentage}%` : '—'}</span>
        </div>
      </div>
      <div className="popmeter-track">
        <div className="popmeter-fill" style={{ width: s.count ? `${s.percentage}%` : '0%' }} />
      </div>
      {!compact && <p className="popmeter-hint">{hint}</p>}
      <style>{`
        .popmeter {
          margin-top: 0.65rem;
          padding: 0.65rem 0.75rem;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .popmeter--compact {
          margin-top: 0.5rem;
          padding: 0.45rem 0.55rem;
        }
        .popmeter--golden {
          border-color: rgba(255, 215, 0, 0.35);
          box-shadow: 0 0 20px rgba(255, 200, 80, 0.08);
        }
        .popmeter--plain {
          border-color: rgba(180, 150, 120, 0.3);
        }
        .popmeter--burnt {
          border-color: rgba(180, 80, 60, 0.35);
          box-shadow: 0 0 16px rgba(120, 40, 30, 0.12);
        }
        .popmeter--unrated {
          border-color: rgba(139, 146, 168, 0.25);
        }
        .popmeter-top {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.45rem;
        }
        .popmeter--compact .popmeter-top {
          margin-bottom: 0.35rem;
        }
        .popmeter-icons {
          display: flex;
          align-items: center;
          gap: 0.1rem;
          font-size: 1.15rem;
          line-height: 1;
        }
        .popmeter--compact .popmeter-icons {
          font-size: 0.95rem;
        }
        .popmeter-icon-sub {
          font-size: 0.85em;
          opacity: 0.9;
        }
        .popmeter-text {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.05rem;
        }
        .popmeter-name {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-muted);
        }
        .popmeter-tier {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text);
        }
        .popmeter--compact .popmeter-tier {
          font-size: 0.72rem;
        }
        .popmeter-pct-wrap {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.1rem;
        }
        .popmeter-soon {
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--accent-2);
        }
        .popmeter-pct {
          font-size: 1rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          color: var(--accent-2);
        }
        .popmeter--compact .popmeter-pct {
          font-size: 0.85rem;
        }
        .popmeter-track {
          height: 8px;
          border-radius: 999px;
          background: var(--bg-card);
          overflow: hidden;
        }
        .popmeter--compact .popmeter-track {
          height: 6px;
        }
        .popmeter-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .popmeter--golden .popmeter-fill {
          background: linear-gradient(90deg, #b8860b, #ffd700, #fff4a8);
          box-shadow: 0 0 12px rgba(255, 215, 0, 0.45);
        }
        .popmeter--plain .popmeter-fill {
          background: linear-gradient(90deg, #6b5344, #c4a57b, #e8d4bc);
        }
        .popmeter--burnt .popmeter-fill {
          background: linear-gradient(90deg, #2d1810, #5c2a1a, #8b3a2a);
        }
        .popmeter--unrated .popmeter-fill {
          background: transparent;
        }
        .popmeter--unrated .popmeter-track {
          background: repeating-linear-gradient(
            90deg,
            var(--bg-card),
            var(--bg-card) 4px,
            rgba(255, 255, 255, 0.04) 4px,
            rgba(255, 255, 255, 0.04) 8px
          );
        }
        .popmeter-hint {
          margin: 0.45rem 0 0;
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
