import { PopKernelIcon } from './PopKernelIcon.jsx';

export function Loader({ label = 'Loading...' }) {
  return (
    <div className="loader-wrap" aria-busy="true" aria-label={label}>
      <div className="loader-popcorn">
        <span><PopKernelIcon /></span>
        <span><PopKernelIcon /></span>
        <span><PopKernelIcon /></span>
      </div>
      <p className="loader-text">{label}</p>
      <style>{`
        .loader-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 3rem;
        }
        .loader-popcorn {
          display: flex;
          gap: 0.35rem;
        }
        .loader-popcorn span {
          color: var(--accent-2);
          animation: bounce 0.6s ease infinite alternate;
        }
        .loader-popcorn span:nth-child(2) {
          animation-delay: 0.15s;
        }
        .loader-popcorn span:nth-child(3) {
          animation-delay: 0.3s;
        }
        @keyframes bounce {
          from {
            transform: translateY(0);
            opacity: 0.5;
          }
          to {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
        .loader-text {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}

export function MovieGridSkeleton({ count = 8 }) {
  return (
    <div className="movie-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton-card">
          <div className="skeleton poster-skel" />
          <div className="skel-body">
            <div className="skeleton line w-80" />
            <div className="skeleton line w-50 mt" />
            <div className="skeleton line w-30 mt" />
          </div>
          <style>{`
            .skeleton-card {
              pointer-events: none;
            }
            .poster-skel {
              aspect-ratio: 2/3;
              width: 100%;
            }
            .skel-body {
              padding: 1rem;
            }
            .line {
              height: 14px;
            }
            .w-80 {
              width: 80%;
            }
            .w-50 {
              width: 50%;
            }
            .w-30 {
              width: 30%;
            }
            .mt {
              margin-top: 0.5rem;
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="detail-skel animate-in">
      <div className="skeleton poster-lg" />
      <div className="detail-skel-info">
        <div className="skeleton line-xl" />
        <div className="skeleton line-md mt" />
        <div className="skeleton para" />
        <div className="skeleton para short" />
      </div>
      <style>{`
        .detail-skel {
          display: grid;
          grid-template-columns: minmax(200px, 320px) 1fr;
          gap: 2rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .detail-skel {
            grid-template-columns: 1fr;
          }
        }
        .poster-lg {
          aspect-ratio: 2/3;
          border-radius: var(--radius);
          max-width: 320px;
        }
        .line-xl {
          height: 36px;
          width: 70%;
        }
        .line-md {
          height: 20px;
          width: 40%;
        }
        .para {
          height: 12px;
          width: 100%;
          margin-top: 1.25rem;
        }
        .para.short {
          width: 85%;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
