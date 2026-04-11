export function posterSrc(movie) {
  return movie?.posterUrl || '';
}

export function hasPoster(movie) {
  return Boolean(movie?.posterUrl);
}

export function posterFallbackClass(movie) {
  return hasPoster(movie) ? '' : 'poster-fallback-active';
}

export function usePosterFallback(event) {
  event.currentTarget.hidden = true;
  const frame = event.currentTarget.closest('[data-poster-frame]');
  if (frame) {
    frame.classList.add('poster-fallback-active');
  }
}
