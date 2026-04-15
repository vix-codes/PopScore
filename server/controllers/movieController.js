import Movie from '../models/Movie.js';
import Review from '../models/Review.js';
import { getRatingBreakdown } from '../utils/movieStats.js';

const realPosterFilter = {
  posterUrl: { $exists: true, $ne: '', $not: /placehold\.co/i },
};

async function posterUrlIsReachable(url) {
  try {
    if (/^data:image\/(png|jpe?g|webp);base64,/i.test(url)) {
      return url.length <= 2_000_000;
    }

    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;

    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
    if (!res.ok) return false;

    const type = res.headers.get('content-type') || '';
    return type.startsWith('image/');
  } catch {
    return false;
  }
}

export async function listMovies(req, res) {
  try {
    const { search, genre, sort } = req.query;
    const filter = { ...realPosterFilter };

    if (search && String(search).trim()) {
      filter.title = { $regex: String(search).trim(), $options: 'i' };
    }

    if (genre) {
      const genres = Array.isArray(genre) ? genre : String(genre).split(',').map((g) => g.trim()).filter(Boolean);
      if (genres.length) {
        filter.genre = { $in: genres };
      }
    }

    let sortSpec = { createdAt: -1 };
    if (sort === 'rating') sortSpec = { avgRating: -1, reviewCount: -1 };
    else if (sort === 'rating_asc') sortSpec = { avgRating: 1 };
    else if (sort === 'year') sortSpec = { year: -1 };
    else if (sort === 'year_asc') sortSpec = { year: 1 };

    const movies = await Movie.find(filter).sort(sortSpec).lean();
    res.json(movies);
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function topMovies(req, res) {
  try {
    const movies = await Movie.find(realPosterFilter)
      .sort({ avgRating: -1, reviewCount: -1 })
      .limit(5)
      .lean();
    res.json(movies);
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function getMovie(req, res) {
  try {
    const movie = await Movie.findById(req.params.id).lean();
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    const breakdown = await getRatingBreakdown(movie._id);
    res.json({ ...movie, ratingBreakdown: breakdown });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function createMovie(req, res) {
  try {
    const { title, genre, year, description, posterUrl } = req.body;
    if (!title || !year || !description || !posterUrl) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!(await posterUrlIsReachable(posterUrl))) {
      return res.status(400).json({ message: 'Poster image URL is not reachable' });
    }
    const movie = await Movie.create({
      title,
      genre: Array.isArray(genre) ? genre : genre ? [genre] : [],
      year: Number(year),
      description,
      posterUrl,
      avgRating: 0,
      reviewCount: 0,
    });
    res.status(201).json(movie);
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function updateMovie(req, res) {
  try {
    const { title, genre, year, description, posterUrl } = req.body;
    const update = {};
    if (title != null) update.title = title;
    if (genre != null) update.genre = Array.isArray(genre) ? genre : [genre];
    if (year != null) update.year = Number(year);
    if (description != null) update.description = description;
    if (posterUrl != null) {
      if (!(await posterUrlIsReachable(posterUrl))) {
        return res.status(400).json({ message: 'Poster image URL is not reachable' });
      }
      update.posterUrl = posterUrl;
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function deleteMovie(req, res) {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    await Review.deleteMany({ movieId: movie._id });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function recommendations(req, res) {
  try {
    const userId = req.userId;
    const reviews = await Review.find({ userId }).populate('movieId', 'genre').lean();
    const genreScores = {};
    for (const r of reviews) {
      const glist = r.movieId?.genre || [];
      const weight = Math.max(Number(r.rating) || 0, 1);
      for (const g of glist) {
        genreScores[g] = (genreScores[g] || 0) + weight;
      }
    }
    const topGenres = Object.entries(genreScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([g]) => g);
    const favoriteGenre = topGenres[0] || null;

    if (!topGenres.length) {
      const fallback = await Movie.find(realPosterFilter).sort({ avgRating: -1 }).limit(6).lean();
      return res.json({ favoriteGenre: null, movies: fallback });
    }

    const reviewedMovieIds = reviews
      .map((r) => {
        const m = r.movieId;
        if (!m) return null;
        return (typeof m === 'object' && m._id ? m._id : m).toString();
      })
      .filter(Boolean);
    const candidates = await Movie.find({
      ...realPosterFilter,
      genre: { $in: topGenres },
      _id: { $nin: reviewedMovieIds },
    })
      .sort({ avgRating: -1, reviewCount: -1 })
      .limit(12)
      .lean();

    res.json({ favoriteGenre, movies: candidates.slice(0, 8) });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}
