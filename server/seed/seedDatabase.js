import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';
import { recalculateMovieStats, sentimentFromRating } from '../utils/movieStats.js';
import { MOVIES_RAW } from './moviesData.js';

const tmdb = (path) => `https://image.tmdb.org/t/p/w500${path}`;

const BROKEN_TMDB_POSTERS = new Set([
  'Aliens',
  'Amélie',
  'Arrival',
  'Avatar',
  'Baby Driver',
  'Barbie',
  'Black Panther',
  'Blade Runner 2049',
  'Casino',
  'Coco',
  'Encanto',
  'Eternal Sunshine of the Spotless Mind',
  'Ex Machina',
  'Fight Club',
  'Finding Nemo',
  'Get Out',
  'Gone Girl',
  'Heat',
  'Her',
  'Inglourious Basterds',
  'Inside Out',
  'John Wick',
  'Jurassic Park',
  'Kill Bill: Vol. 1',
  'Knives Out',
  'Mad Max: Fury Road',
  'Madagascar',
  'Moana',
  'Nightcrawler',
  'No Country for Old Men',
  'Pride & Prejudice',
  'Prisoners',
  'Pulp Fiction',
  'Ratatouille',
  'Raya and the Last Dragon',
  'Saving Private Ryan',
  'Scott Pilgrim vs. the World',
  'Se7en',
  'Shaun of the Dead',
  'Shrek',
  'Soul',
  'Spider-Man: Into the Spider-Verse',
  'Terminator 2: Judgment Day',
  'The Batman',
  'The Big Lebowski',
  'The Departed',
  'The Intouchables',
  'The Matrix',
  'The Menu',
  'The Notebook',
  'The Prestige',
  'The Revenant',
  'The Social Network',
  'The Thing',
  'The Truman Show',
  'The Wolf of Wall Street',
  'There Will Be Blood',
  'Titanic',
  'Up',
  'WALL·E',
  'Whiplash',
  'Zootopia',
]);

const REVIEW_LINES = [
  'Absolutely loved it—would watch again opening night.',
  'Solid film; a few slow spots but the payoff lands.',
  'Popcorn-worthy from start to finish.',
  'Great performances even when the script wobbles.',
  'Not my usual genre but this one hooked me.',
  'Cinematography is gorgeous; story is fine.',
  'Rewatch potential is through the roof.',
  'Emotional gut-punch in the best way.',
  'Fun ride—turn your brain off and enjoy.',
  'Thought-provoking without being preachy.',
  'Soundtrack alone deserves five popcorns.',
  'Pacing drags in the middle but sticks the landing.',
  'Instant classic for me.',
  'Overhyped but still pretty good.',
  'Perfect Sunday afternoon watch.',
  'Left the theater grinning.',
  'Dark, bold, and unforgettable.',
  'Would recommend to any film fan.',
  'Some plot holes but I did not care.',
  'The third act goes hard.',
  'Heartfelt and surprisingly funny.',
  'Edge of my seat the whole time.',
  'Nostalgia hit me like a truck.',
  'Deserved more awards buzz.',
  'I get why people adore this.',
  'Clever twists I did not see coming.',
  'Character work is top tier.',
  'A bit long but worth every minute.',
  'Pure adrenaline.',
  'Subtle and haunting.',
  'Family watched together—big hit.',
  'I cried. No shame.',
  'Villain steals every scene.',
  'World-building is incredible.',
  'Quippy dialogue done right.',
  'Better on a second viewing.',
  'Could have been shorter, still great.',
  'Ambitious and mostly pulls it off.',
  'This is why I love movies.',
  'Crowd was cheering in my screening.',
  'Left me thinking for days.',
  'Perfect cast chemistry.',
  'Some cringe, mostly charm.',
  'Would pair well with pizza.',
  'Masterclass in tension.',
  'Color and music are a vibe.',
  'Went in skeptical—came out converted.',
  'Deserves a big screen if you can.',
  'Comfort movie unlocked.',
  'Wild ending—still processing.',
  'Reminded me why I use PopScore.',
];

function shuffleForSeed(items, seed) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.abs((seed * 9301 + 49297 + i * 1009) % (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const EXTRA_USERS = [
  { username: 'popcornqueen', email: 'alice@popscore.com' },
  { username: 'reelbuff', email: 'bob@popscore.com' },
  { username: 'nightowl', email: 'casey@popscore.com' },
  { username: 'cinephile_d', email: 'dana@popscore.com' },
  { username: 'marathon_mia', email: 'mia@popscore.com' },
  { username: 'silent_j', email: 'jay@popscore.com' },
  { username: 'oscar_opus', email: 'opus@popscore.com' },
  { username: 'trailerpark', email: 'tara@popscore.com' },
  { username: 'imax_ivy', email: 'ivy@popscore.com' },
  { username: 'filmnoir_ned', email: 'ned@popscore.com' },
  { username: 'sundance_sam', email: 'sam@popscore.com' },
  { username: 'blockbuster_bex', email: 'bex@popscore.com' },
];

/**
 * @param {{ forceWipe?: boolean }} opts - CLI seed uses forceWipe: true. Server uses false and skips if movies exist.
 * @returns {Promise<{ skipped?: boolean, movies?: number }>}
 */
export async function seedDatabase(opts = {}) {
  const forceWipe = Boolean(opts.forceWipe);

  if (!forceWipe) {
    const [movies, users] = await Promise.all([Movie.countDocuments(), User.countDocuments()]);
    if (movies > 0 || users > 0) return { skipped: true };
  }

  await Review.deleteMany({});
  await Movie.deleteMany({});
  await User.deleteMany({});

  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('demo123', 10);

  const admin = await User.create({
    username: 'admin',
    email: 'admin@popscore.com',
    password: adminPass,
    role: 'admin',
    favorites: [],
  });

  const demo = await User.create({
    username: 'democritic',
    email: 'demo@popscore.com',
    password: userPass,
    role: 'user',
    favorites: [],
  });

  const critic = await User.create({
    username: 'filmfan',
    email: 'film@popscore.com',
    password: userPass,
    role: 'user',
    favorites: [],
  });

  const extras = [];
  for (const u of EXTRA_USERS) {
    extras.push(
      await User.create({
        username: u.username,
        email: u.email,
        password: userPass,
        role: 'user',
        favorites: [],
      })
    );
  }

  const reviewers = [demo, critic, ...extras];

  const inserted = [];
  for (const row of MOVIES_RAW) {
    const [title, genre, year, description, posterPath] = row;
    if (BROKEN_TMDB_POSTERS.has(title)) continue;
    const doc = await Movie.create({
      title,
      genre,
      year,
      description,
      posterUrl: tmdb(posterPath),
      avgRating: 0,
      reviewCount: 0,
    });
    inserted.push(doc);
  }

  for (let mi = 0; mi < inserted.length; mi++) {
    const movie = inserted[mi];
    const want = Math.min(7 + (mi % 6), reviewers.length);
    const picks = shuffleForSeed(reviewers, mi + 1).slice(0, want);
    for (let ri = 0; ri < picks.length; ri++) {
      const u = picks[ri];
      const rating = 1 + ((mi * 7 + ri * 11 + mi * ri) % 5);
      const text = REVIEW_LINES[(mi + ri * 3) % REVIEW_LINES.length];
      const likes = (mi * 17 + ri * 9) % 48;
      await Review.create({
        userId: u._id,
        movieId: movie._id,
        rating,
        text,
        likes,
        sentiment: sentimentFromRating(rating),
      });
    }
  }

  const adminSlots = 10;
  for (let k = 0; k < adminSlots; k++) {
    const idx = Math.min(inserted.length - 1, Math.floor(((k + 1) / (adminSlots + 1)) * inserted.length));
    const movie = inserted[idx];
    const exists = await Review.findOne({ userId: admin._id, movieId: movie._id });
    if (exists) continue;
    const rating = 3 + (idx % 3);
    await Review.create({
      userId: admin._id,
      movieId: movie._id,
      rating,
      text: 'Admin note: strong catalog title—worth keeping in rotation.',
      likes: (idx % 20) + 2,
      sentiment: sentimentFromRating(rating),
    });
  }

  for (const movie of inserted) {
    await recalculateMovieStats(movie._id);
  }

  admin.favorites = [inserted[0]._id, inserted[1]._id, inserted[4]._id];
  demo.favorites = [inserted[2]._id, inserted[5]._id, inserted[7]._id, inserted[12]._id];
  critic.favorites = [inserted[3]._id, inserted[8]._id, inserted[11]._id];
  if (extras[0]) extras[0].favorites = [inserted[6]._id, inserted[10]._id];
  if (extras[1]) extras[1].favorites = [inserted[9]._id, inserted[14]._id];
  await admin.save();
  await demo.save();
  await critic.save();
  for (const u of extras) {
    if (u.favorites?.length) await u.save();
  }

  const reviewCount = await Review.countDocuments();
  console.log(`Seed complete. Movies: ${inserted.length}  Reviews: ${reviewCount}`);
  return { skipped: false, movies: inserted.length, reviews: reviewCount };
}
