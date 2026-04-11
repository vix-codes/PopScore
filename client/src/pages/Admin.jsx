import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { MovieGridSkeleton } from '../components/Loader.jsx';
import { PopMeter } from '../components/PopMeter.jsx';
import { hasPoster, posterFallbackClass, posterSrc, usePosterFallback } from '../utils/poster.js';

const emptyForm = {
  title: '',
  genre: '',
  year: '',
  description: '',
  posterUrl: '',
};

export function Admin() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/movies');
      setMovies(data);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const parseGenres = (s) =>
    String(s || '')
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        genre: parseGenres(form.genre),
        year: Number(form.year),
        description: form.description.trim(),
        posterUrl: form.posterUrl.trim(),
      };
      if (editingId) {
        await api.put(`/movies/${editingId}`, payload);
      } else {
        await api.post('/movies', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Request failed');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (m) => {
    setEditingId(m._id);
    setForm({
      title: m.title,
      genre: (m.genre || []).join(', '),
      year: String(m.year),
      description: m.description,
      posterUrl: m.posterUrl,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this movie and its reviews?')) return;
    setBusy(true);
    try {
      await api.delete(`/movies/${id}`);
      if (editingId === id) cancelEdit();
      await load();
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page admin-page animate-in">
      <h1 className="section-title">Admin — movies</h1>
      <p className="lead">Add, edit, or remove titles in the catalog.</p>

      <div className="admin-form card">
        <h2 className="form-title">{editingId ? 'Edit movie' : 'Add movie'}</h2>
        {err && <div className="error-banner">{err}</div>}
        <form onSubmit={submit} className="grid-form">
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Genres (comma-separated)</label>
            <input
              className="input"
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              placeholder="Sci-Fi, Thriller"
            />
          </div>
          <div>
            <label className="label">Year</label>
            <input
              className="input"
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              required
            />
          </div>
          <div className="full">
            <label className="label">Poster URL</label>
            <input
              className="input"
              value={form.posterUrl}
              onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
              required
            />
          </div>
          <div className="full">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div className="full actions">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : editingId ? 'Update movie' : 'Create movie'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={cancelEdit} disabled={busy}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h2 className="section-title sub">All movies</h2>
      {loading ? (
        <MovieGridSkeleton />
      ) : (
        <div className="admin-list">
          {movies.map((m) => (
            <div key={m._id} className="card admin-row">
              <div className={`thumb-frame ${posterFallbackClass(m)}`} data-poster-frame>
                {hasPoster(m) && (
                  <img src={posterSrc(m)} alt="" className="thumb" onError={usePosterFallback} />
                )}
                <span className="thumb-fallback" aria-hidden="true">Poster unavailable</span>
              </div>
              <div className="info">
                <strong>{m.title}</strong>
                <span className="meta">
                  {m.year} · {(m.genre || []).join(', ')}
                </span>
                <PopMeter avgRating={m.avgRating} reviewCount={m.reviewCount} year={m.year} compact />
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn-ghost" onClick={() => startEdit(m)} disabled={busy}>
                  Edit
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => remove(m._id)} disabled={busy}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .lead {
          color: var(--text-muted);
          margin: -0.5rem 0 1.5rem;
        }
        .admin-form {
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .admin-form:hover {
          transform: none;
        }
        .form-title {
          margin: 0 0 1rem;
          font-size: 1.1rem;
        }
        .grid-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .grid-form .full {
          grid-column: 1 / -1;
        }
        .actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .grid-form {
            grid-template-columns: 1fr;
          }
        }
        .section-title.sub {
          font-size: 1.35rem;
        }
        .admin-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .admin-row {
          display: grid;
          grid-template-columns: 56px 1fr auto;
          gap: 1rem;
          align-items: start;
          padding: 0.75rem 1rem;
        }
        .admin-row:hover {
          transform: none;
        }
        .thumb {
          width: 56px;
          height: 84px;
          object-fit: cover;
          display: block;
        }
        .thumb-frame {
          position: relative;
          width: 56px;
          height: 84px;
          border-radius: 8px;
          overflow: hidden;
          background: #101219;
        }
        .thumb-fallback {
          position: absolute;
          inset: 0;
          display: none;
          place-items: center;
          padding: 0.35rem;
          text-align: center;
          color: var(--accent-2);
          font-size: 0.58rem;
          font-weight: 800;
          line-height: 1.1;
        }
        .poster-fallback-active .thumb-fallback {
          display: grid;
        }
        .info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
        }
        .meta {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .row-actions {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}
