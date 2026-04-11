import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { MovieCard } from '../components/MovieCard.jsx';
import { MovieGridSkeleton } from '../components/Loader.jsx';
import { moviesWithRealPosters } from '../utils/poster.js';

export function Favorites() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/users/favorites');
        setMovies(moviesWithRealPosters(data));
      } catch {
        setMovies([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const removeUnavailablePoster = (id) => {
    setMovies((items) => items.filter((m) => m._id !== id));
  };

  return (
    <div className="page fav-page animate-in">
      <h1 className="section-title">Your favorites</h1>
      <p className="lead">Movies you saved from detail pages appear here.</p>
      {loading ? (
        <MovieGridSkeleton count={4} />
      ) : movies.length ? (
        <div className="movie-grid">
          {movies.map((m) => (
            <MovieCard key={m._id} movie={m} onPosterUnavailable={removeUnavailablePoster} />
          ))}
        </div>
      ) : (
        <p className="muted">No favorites yet. Tap “Save to favorites” on a movie you love.</p>
      )}
      <style>{`
        .lead {
          color: var(--text-muted);
          margin: -0.5rem 0 1.5rem;
        }
        .movie-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.25rem;
        }
        .muted {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
