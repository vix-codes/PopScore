const bcrypt = require("bcryptjs");

const adminPasswordHash = bcrypt.hashSync("Admin@123", 10);
const demoPasswordHash = bcrypt.hashSync("User@123", 10);

const users = [
  {
    id: "user-admin",
    name: "PopScore Admin",
    email: "admin@popscore.com",
    passwordHash: adminPasswordHash,
    role: "admin",
    createdAt: "2026-04-01T09:00:00.000Z"
  },
  {
    id: "user-demo",
    name: "Demo Reviewer",
    email: "user@popscore.com",
    passwordHash: demoPasswordHash,
    role: "user",
    createdAt: "2026-04-01T09:05:00.000Z"
  }
];

const movies = [
  {
    id: "movie-dune-part-two",
    title: "Dune: Part Two",
    year: 2024,
    releaseDate: "2024-03-01",
    duration: 166,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    director: "Denis Villeneuve",
    cast: ["Timothee Chalamet", "Zendaya", "Rebecca Ferguson", "Austin Butler"],
    language: "English",
    country: "USA",
    description: "Paul Atreides embraces destiny while rival powers collide across Arrakis.",
    longSynopsis:
      "As prophecy, politics, and revenge converge, Paul must decide whether he will remain a survivor or become the myth everyone fears. The result is a massive-scale epic that still leaves room for intimacy, longing, and grief.",
    criticScore: 92,
    featuredQuote: "Huge, severe, and unexpectedly romantic.",
    status: "Now Streaming",
    palette: ["#d86a27", "#31170e"],
    backdropPalette: ["#e7b465", "#2a1108"]
  },
  {
    id: "movie-oppenheimer",
    title: "Oppenheimer",
    year: 2023,
    releaseDate: "2023-07-21",
    duration: 180,
    genres: ["Biography", "Drama", "History"],
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr.", "Matt Damon"],
    language: "English",
    country: "USA",
    description: "A brilliant physicist wrestles with ambition, consequence, and legacy.",
    longSynopsis:
      "The making of the atomic bomb becomes both a procedural thriller and a character study about the cost of being indispensable to history. Conversations become battles, and every victory carries fallout.",
    criticScore: 94,
    featuredQuote: "A historical drama staged like a detonation.",
    status: "Award Winner",
    palette: ["#ff8f4f", "#1f1f23"],
    backdropPalette: ["#f6c06a", "#281d1a"]
  },
  {
    id: "movie-past-lives",
    title: "Past Lives",
    year: 2023,
    releaseDate: "2023-06-23",
    duration: 106,
    genres: ["Romance", "Drama"],
    director: "Celine Song",
    cast: ["Greta Lee", "Teo Yoo", "John Magaro"],
    language: "English / Korean",
    country: "USA",
    description: "Two childhood friends reconnect and quietly rewrite each other's futures.",
    longSynopsis:
      "Over decades and across continents, a relationship that never fully disappears keeps resurfacing in different emotional registers. The film explores migration, longing, and the strange shape of alternate lives.",
    criticScore: 96,
    featuredQuote: "Soft-spoken, devastating, and deeply observant.",
    status: "Critics' Pick",
    palette: ["#4a8aa5", "#161f31"],
    backdropPalette: ["#9bd4d9", "#192033"]
  },
  {
    id: "movie-spider-verse",
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    releaseDate: "2023-06-02",
    duration: 140,
    genres: ["Animation", "Action", "Adventure"],
    director: "Joaquim Dos Santos",
    cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
    language: "English",
    country: "USA",
    description: "Miles Morales leaps through dimensions and discovers how heavy heroism can feel.",
    longSynopsis:
      "What begins as an exuberant multiverse sprint becomes a story about identity, family pressure, and whether institutions built by heroes are always worth trusting. The animation style is relentlessly inventive.",
    criticScore: 95,
    featuredQuote: "A fireworks show with a pulse.",
    status: "Fan Favorite",
    palette: ["#d82e7b", "#28144a"],
    backdropPalette: ["#f75d93", "#1d0d35"]
  },
  {
    id: "movie-the-batman",
    title: "The Batman",
    year: 2022,
    releaseDate: "2022-03-04",
    duration: 176,
    genres: ["Crime", "Drama", "Action"],
    director: "Matt Reeves",
    cast: ["Robert Pattinson", "Zoe Kravitz", "Paul Dano", "Jeffrey Wright"],
    language: "English",
    country: "USA",
    description: "A detective story soaked in rain, obsession, and urban corruption.",
    longSynopsis:
      "Batman is still early in his crusade, less legend than scar tissue. The film leans into noir textures, procedural clues, and a Gotham that feels both mythic and rotting from the inside.",
    criticScore: 85,
    featuredQuote: "A superhero movie that prefers bruises to triumph.",
    status: "Streaming",
    palette: ["#952727", "#121212"],
    backdropPalette: ["#d7443f", "#180e0e"]
  },
  {
    id: "movie-everything-everywhere",
    title: "Everything Everywhere All at Once",
    year: 2022,
    releaseDate: "2022-04-08",
    duration: 139,
    genres: ["Sci-Fi", "Comedy", "Drama"],
    director: "Daniel Kwan & Daniel Scheinert",
    cast: ["Michelle Yeoh", "Ke Huy Quan", "Stephanie Hsu", "Jamie Lee Curtis"],
    language: "English / Mandarin",
    country: "USA",
    description: "An overwhelmed woman discovers that absurdity might be the key to grace.",
    longSynopsis:
      "The multiverse is played for chaos, slapstick, philosophy, and family reckoning all at once. Underneath the genre mash-up sits a story about exhaustion, tenderness, and choosing connection over nihilism.",
    criticScore: 94,
    featuredQuote: "Wildly maximal and sincerely human.",
    status: "Award Winner",
    palette: ["#f06f23", "#1f1730"],
    backdropPalette: ["#ffd26d", "#2b1734"]
  }
];

const reviews = [
  {
    id: "review-001",
    movieId: "movie-dune-part-two",
    userId: "user-demo",
    author: "Demo Reviewer",
    headline: "Epic with actual emotional weight",
    comment: "The scale is incredible, but what stayed with me was how tragic and intimate it feels.",
    rating: 5,
    watchedOn: "2026-04-02",
    containsSpoilers: false,
    createdAt: "2026-04-02T12:00:00.000Z",
    updatedAt: "2026-04-02T12:00:00.000Z"
  },
  {
    id: "review-002",
    movieId: "movie-oppenheimer",
    userId: "user-admin",
    author: "PopScore Admin",
    headline: "Dense but gripping",
    comment: "A demanding film that rewards attention, especially once the political fallout takes over.",
    rating: 4,
    watchedOn: "2026-04-03",
    containsSpoilers: false,
    createdAt: "2026-04-03T12:00:00.000Z",
    updatedAt: "2026-04-03T12:00:00.000Z"
  },
  {
    id: "review-003",
    movieId: "movie-past-lives",
    userId: "user-demo",
    author: "Demo Reviewer",
    headline: "Quietly devastating",
    comment: "It says so much with glances and unfinished conversations. Beautifully restrained.",
    rating: 5,
    watchedOn: "2026-04-04",
    containsSpoilers: false,
    createdAt: "2026-04-04T12:00:00.000Z",
    updatedAt: "2026-04-04T12:00:00.000Z"
  }
];

module.exports = { users, movies, reviews };
