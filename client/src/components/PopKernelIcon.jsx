export function PopKernelIcon({ size = 24, className = '' }) {
  return (
    <svg
      className={`pop-kernel-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M17.2 8.8c2.9-4.8 10.3-4.7 13 .2 4.1-.8 8 2.4 8 6.7 0 2.2-1.1 4.2-2.8 5.5 2.1 1.8 3.4 4.5 3.4 7.6 0 7.1-6 12.3-14.8 12.3S9.2 35.9 9.2 28.8c0-3.3 1.5-6.2 3.8-8-1.5-1.3-2.4-3.2-2.4-5.2 0-4.2 3.6-7.3 6.6-6.8Z"
        fill="currentColor"
      />
      <path
        d="M18.5 16.5c1.9-2.1 5.5-1.2 6.1 1.6 2.6-1.6 6.2.2 6.3 3.3"
        fill="none"
        stroke="rgba(20, 14, 8, 0.35)"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function PopKernelCluster({ count = 3, size = 20, className = '' }) {
  return (
    <span className={`pop-kernel-cluster ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <PopKernelIcon key={i} size={size} />
      ))}
      <style>{`
        .pop-kernel-cluster {
          display: inline-flex;
          align-items: center;
          gap: 0.05rem;
        }
        .pop-kernel-cluster .pop-kernel-icon {
          margin-left: -0.18rem;
        }
        .pop-kernel-cluster .pop-kernel-icon:first-child {
          margin-left: 0;
        }
      `}</style>
    </span>
  );
}
