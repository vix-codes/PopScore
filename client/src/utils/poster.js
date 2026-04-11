export function fallbackPosterUrl(title = 'PopScore') {
  const label = encodeURIComponent(String(title || 'PopScore').trim() || 'PopScore');
  return `https://placehold.co/500x750/141414/f5b942/png?text=${label}`;
}

export function posterSrc(movie) {
  return movie?.posterUrl || fallbackPosterUrl(movie?.title);
}

export function usePosterFallback(event, title) {
  const fallback = fallbackPosterUrl(title);
  if (event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback;
  }
}
