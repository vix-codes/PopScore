import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";

const dummyMovies = [
  {
    _id: "1",
    title: "Inception",
    genre: "Sci-Fi",
    year: 2010,
    duration: 148,
    posterUrl:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=80",
    avgRating: 4.7,
    reviewCount: 128,
    description:
      "A thief who enters dreams is offered one last impossible mission that bends reality.",
  },
  {
    _id: "2",
    title: "The Dark Knight",
    genre: "Action",
    year: 2008,
    duration: 152,
    posterUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
    avgRating: 4.9,
    reviewCount: 204,
    description:
      "Batman faces a ruthless criminal mastermind who turns Gotham into a city under siege.",
  },
  {
    _id: "3",
    title: "Interstellar",
    genre: "Drama",
    year: 2014,
    duration: 169,
    posterUrl:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80",
    avgRating: 4.8,
    reviewCount: 187,
    description:
      "Explorers cross the galaxy searching for a future for humanity as time slips away on Earth.",
  },
  {
    _id: "4",
    title: "Pulp Fiction",
    genre: "Crime",
    year: 1994,
    duration: 154,
    posterUrl:
      "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=900&q=80",
    avgRating: 4.6,
    reviewCount: 143,
    description:
      "Interwoven stories of hitmen, thieves, and chance encounters unfold across Los Angeles.",
  },
  {
    _id: "5",
    title: "The Conjuring",
    genre: "Horror",
    year: 2013,
    duration: 112,
    posterUrl:
      "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=900&q=80",
    avgRating: 4.2,
    reviewCount: 96,
    description:
      "Paranormal investigators confront a dark presence that pushes a family to the edge.",
  },
  {
    _id: "6",
    title: "Forrest Gump",
    genre: "Comedy",
    year: 1994,
    duration: 142,
    posterUrl:
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80",
    avgRating: 4.7,
    reviewCount: 165,
    description:
      "A gentle man unexpectedly influences history while holding onto the people he loves.",
  },
  {
    _id: "7",
    title: "Blade Runner 2049",
    genre: "Thriller",
    year: 2017,
    duration: 164,
    posterUrl:
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=900&q=80",
    avgRating: 4.5,
    reviewCount: 118,
    description:
      "A futuristic detective uncovers secrets that could reshape what it means to be human.",
  },
  {
    _id: "8",
    title: "Spirited Away",
    genre: "Fantasy",
    year: 2001,
    duration: 125,
    posterUrl:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=80",
    avgRating: 4.9,
    reviewCount: 176,
    description:
      "A young girl enters a spirit world and grows braver with every strange challenge she faces.",
  },
];

const sortOptions = [
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "reviews", label: "Most Reviewed" },
];

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("highest");

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const response = await axios.get("/api/movies");
        setMovies(response.data);
      } catch (apiError) {
        setMovies(dummyMovies);
        setError("Using demo movie data until the backend is ready.");
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const genres = useMemo(() => {
    const uniqueGenres = Array.from(
      new Set((movies.length ? movies : dummyMovies).map((movie) => movie.genre))
    );

    return ["All", ...uniqueGenres];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    const source = movies.length ? movies : dummyMovies;

    const filtered = source.filter((movie) => {
      const matchesGenre =
        selectedGenre === "All" || movie.genre === selectedGenre;
      const matchesSearch =
        !searchTerm || movie.title.toLowerCase().includes(searchTerm);

      return matchesGenre && matchesSearch;
    });

    const sorted = [...filtered];

    sorted.sort((first, second) => {
      if (sortBy === "lowest") {
        return first.avgRating - second.avgRating;
      }

      if (sortBy === "newest") {
        return second.year - first.year;
      }

      if (sortBy === "oldest") {
        return first.year - second.year;
      }

      if (sortBy === "reviews") {
        return second.reviewCount - first.reviewCount;
      }

      return second.avgRating - first.avgRating;
    });

    return sorted;
  }, [movies, searchTerm, selectedGenre, sortBy]);

  const stats = useMemo(() => {
    const source = movies.length ? movies : dummyMovies;
    const totalReviews = source.reduce(
      (sum, movie) => sum + (movie.reviewCount || 0),
      0
    );

    return {
      movieCount: source.length,
      totalReviews,
    };
  }, [movies]);

  return (
    <main className="page-shell">
      <section className="topbar">
        <div className="brand-block">
          <div className="brand-mark">MH</div>
          <div>
            <p className="brand-name">MovieHub</p>
            <p className="brand-tag">Reviews people trust</p>
          </div>
        </div>

        <nav className="topnav">
          <a href="/">Home</a>
          <a href="/">Movies</a>
          <a href="/">Genres</a>
        </nav>

        <label className="search-shell" htmlFor="movie-search">
          <span>Search</span>
          <input
            id="movie-search"
            type="text"
            placeholder="Search movies..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </label>
      </section>

      <section className="hero-banner">
        <div className="hero-copy-block">
          <p className="eyebrow">Discover. Watch. Review.</p>
          <h1>Real reviews from real movie fans.</h1>
          <p className="hero-copy">
            Read audience opinions, compare ratings, and find your next favorite
            film without digging through clutter.
          </p>

          <div className="hero-actions">
            <button className="primary-btn" type="button">
              Browse Movies
            </button>
            <button className="secondary-btn" type="button">
              How It Works
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span>{stats.movieCount}</span>
            <p>Movies on display</p>
          </div>
          <div className="stat-card">
            <span>{stats.totalReviews}</span>
            <p>User reviews counted</p>
          </div>
          <div className="stat-card">
            <span>{filteredMovies.length}</span>
            <p>Results after filters</p>
          </div>
        </div>
      </section>

      <section className="catalog-section">
        <div className="control-header">
          <div>
            <p className="eyebrow">Genre Filter</p>
            <h2>Find a movie that fits your mood</h2>
          </div>
          {error ? <p className="helper-text">{error}</p> : null}
        </div>

        <div className="genre-row">
          {genres.map((genre) => (
            <button
              key={genre}
              className={
                genre === selectedGenre ? "genre-button active" : "genre-button"
              }
              type="button"
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="toolbar">
          <div className="toolbar-group">
            <label className="sort-control" htmlFor="sort-by">
              <span>Sort by</span>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="results-count">{filteredMovies.length} movies found</p>
        </div>

        {loading ? (
          <div className="status-panel">Loading movies...</div>
        ) : filteredMovies.length ? (
          <div className="movie-grid">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="status-panel">
            No movies match your current search and filter settings.
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;
