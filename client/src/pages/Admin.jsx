import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { MovieGridSkeleton } from '../components/Loader.jsx';
import { PopMeter } from '../components/PopMeter.jsx';
import {
  hasPoster,
  moviesWithRealPosters,
  posterFallbackClass,
  posterSrc,
  usePosterFallback,
} from '../utils/poster.js';

const emptyForm = {
  title: '',
  genre: '',
  year: '',
  description: '',
  posterUrl: '',
};

const POSTER_WIDTH = 500;
const POSTER_HEIGHT = 750;

function imageFileToPoster(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(new Error('Choose an image file for the poster.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read poster image.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not load poster image.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = POSTER_WIDTH;
        canvas.height = POSTER_HEIGHT;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(POSTER_WIDTH / img.width, POSTER_HEIGHT / img.height);
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (POSTER_WIDTH - width) / 2;
        const y = (POSTER_HEIGHT - height) / 2;
        ctx.drawImage(img, x, y, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

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
      setMovies(moviesWithRealPosters(data));
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

  const choosePoster = async (file) => {
    setErr('');
    if (!file) return;
    try {
      const posterUrl = await imageFileToPoster(file);
      setForm((current) => ({ ...current, posterUrl }));
    } catch (ex) {
      setErr(ex.message || 'Poster image failed');
    }
  };

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
          <div className="poster-picker">
            <div className={`poster-preview ${form.posterUrl ? '' : 'empty'}`}>
              {form.posterUrl ? <img src={form.posterUrl} alt="" /> : <span>Add poster image</span>}
            </div>
            <label className="btn btn-ghost poster-upload">
              Choose image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => choosePoster(e.target.files?.[0])}
                required={!form.posterUrl}
              />
            </label>
          </div>
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
                <span className="thumb-fallback" aria-hidden="true" />
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
          grid-template-columns: 180px 1fr 1fr;
          gap: 1rem;
          align-items: start;
        }
        .grid-form .full {
          grid-column: 2 / -1;
        }
        .poster-picker {
          grid-row: span 4;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .poster-preview {
          aspect-ratio: 2/3;
          width: 100%;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: #101219;
        }
        .poster-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .poster-preview.empty {
          display: grid;
          place-items: center;
          padding: 1rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 700;
          background:
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.1) 0 12px,
              transparent 12px 20px
            ),
            linear-gradient(160deg, rgba(255, 107, 53, 0.18), transparent 48%),
            #101219;
        }
        .poster-upload {
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        .poster-upload input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
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
          .grid-form .full,
          .poster-picker {
            grid-column: 1;
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
          background:
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.12) 0 8px,
              transparent 8px 13px
            ),
            linear-gradient(160deg, rgba(255, 107, 53, 0.18), transparent 48%),
            #101219;
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
