export function posterSrc(movie) {
  return movie?.posterUrl || '';
}

export function hasPoster(movie) {
  return hasRealPoster(movie);
}

export function hasRealPoster(movie) {
  const url = String(movie?.posterUrl || '');
  return Boolean(url) && (url.startsWith('data:image/') || !url.includes('placehold.co'));
}

export function moviesWithRealPosters(movies = []) {
  return movies.filter(hasRealPoster);
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
