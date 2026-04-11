import { useCallback, useEffect, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MovieCard } from '../components/MovieCard.jsx';
import { SearchBar } from '../components/SearchBar.jsx';
import { FilterBar } from '../components/FilterBar.jsx';
import { Loader, MovieGridSkeleton } from '../components/Loader.jsx';
import { realPostersFirst } from '../utils/poster.js';

export function Home() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [genres, setGenres] = useState([]);
  const [sort, setSort] = useState('newest');
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [reco, setReco] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recoLoading, setRecoLoading] = useState(false);
  const [err, setErr] = useState('');

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (genres.length) params.genre = genres.join(',');
      if (sort && sort !== 'newest') params.sort = sort;
      const { data } = await api.get('/movies', { params });
      setMovies(realPostersFirst(data));
    } catch (e) {
      setErr(e.response?.data?.message || 'Could not load movies');
    } finally {
      setLoading(false);
    }
  }, [search, genres, sort]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/movies/top');
        setTrending(realPostersFirst(data));
      } catch {
        setTrending([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) {
      setReco([]);
      return;
    }
    (async () => {
      setRecoLoading(true);
      try {
        const { data } = await api.get('/movies/recommendations');
        setReco(realPostersFirst(data));
      } catch {
        setReco([]);
      } finally {
        setRecoLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className="page home-page">
      <section className="hero animate-in">
        <h1 className="hero-title">
          Measure movies in <span className="pop-emoji">🍿</span> not stars
        </h1>
        <p className="hero-sub">
          Crowd scores, personal picks, and a cinema-dark watchlist built around your taste.
        </p>
      </section>

      {trending.length > 0 && (
        <section className="trending-block">
          <h2 className="section-title">
            <span className="fire">🔥</span> Trending top 5
          </h2>
          <div className="trending-scroll">
            {trending.map((m) => (
              <div key={m._id} className="trend-card-wrap">
                <MovieCard movie={m} />
              </div>
            ))}
          </div>
        </section>
      )}

      {user && (
        <section className="reco-block">
          <h2 className="section-title">🎯 For you</h2>
          {recoLoading ? (
            <Loader label="Finding picks…" />
          ) : reco.length ? (
            <div className="movie-grid small">
              {reco.map((m) => (
                <MovieCard key={m._id} movie={m} />
              ))}
            </div>
          ) : (
            <p className="muted">Review a few films and we will tailor recommendations to your favorite genres.</p>
          )}
        </section>
      )}

      <section className="catalog">
        <h2 className="section-title">Browse</h2>
        <div className="catalog-toolbar">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <FilterBar selectedGenres={genres} onGenresChange={setGenres} sort={sort} onSortChange={setSort} />
        {err && <div className="error-banner">{err}</div>}
        {loading ? (
          <MovieGridSkeleton />
        ) : (
          <div className="movie-grid">
            {movies.map((m) => (
              <MovieCard key={m._id} movie={m} />
            ))}
          </div>
        )}
        {!loading && !movies.length && <p className="muted center">No movies match your filters.</p>}
      </section>

      <style>{`
        .hero {
          text-align: center;
          padding: 2rem 0 2.5rem;
          max-width: 720px;
          margin: 0 auto;
        }
        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(1.85rem, 4vw, 2.75rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          margin: 0 0 1rem;
          line-height: 1.15;
        }
        .pop-emoji {
          filter: drop-shadow(0 0 12px var(--glow));
        }
        .hero-sub {
          margin: 0;
          color: var(--text-muted);
          font-size: 1.05rem;
          line-height: 1.6;
        }
        .trending-block {
          margin-bottom: 2.5rem;
        }
        .fire {
          margin-right: 0.25rem;
        }
        .trending-scroll {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1rem;
        }
        @media (min-width: 900px) {
          .trending-scroll {
            grid-template-columns: repeat(5, 1fr);
          }
        }
        .reco-block {
          margin-bottom: 2.5rem;
        }
        .movie-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.25rem;
        }
        .movie-grid.small {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }
        .catalog-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 0.5rem;
          align-items: center;
        }
        .muted {
          color: var(--text-muted);
        }
        .center {
          text-align: center;
        }
      `}</style>
    </div>
  );
}
