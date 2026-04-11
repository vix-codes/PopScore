import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';
import { connectDB } from '../config/db.js';
import { recalculateMovieStats, sentimentFromRating } from '../utils/movieStats.js';

const posters = {
  inception: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  darkKnight: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  interstellar: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  parasite: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
  spirited: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  grandBudapest: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
  madMax: 'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhPGipsin.jpg',
  laLaLand: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
  getOut: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU7i5Ujpt.jpg',
  dune: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
};

const moviesData = [
  {
    title: 'Inception',
    genre: ['Sci-Fi', 'Thriller'],
    year: 2010,
    description:
      'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterUrl: posters.inception,
  },
  {
    title: 'The Dark Knight',
    genre: ['Action', 'Crime'],
    year: 2008,
    description:
      'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and DA Harvey Dent, facing the anarchist Joker.',
    posterUrl: posters.darkKnight,
  },
  {
    title: 'Interstellar',
    genre: ['Sci-Fi', 'Drama'],
    year: 2014,
    description:
      'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
    posterUrl: posters.interstellar,
  },
  {
    title: 'Parasite',
    genre: ['Thriller', 'Drama'],
    year: 2019,
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    posterUrl: posters.parasite,
  },
  {
    title: 'Spirited Away',
    genre: ['Animation', 'Fantasy'],
    year: 2001,
    description:
      'During her family move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.',
    posterUrl: posters.spirited,
  },
  {
    title: 'The Grand Budapest Hotel',
    genre: ['Comedy', 'Drama'],
    year: 2014,
    description:
      'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy.',
    posterUrl: posters.grandBudapest,
  },
  {
    title: 'Mad Max: Fury Road',
    genre: ['Action', 'Sci-Fi'],
    year: 2015,
    description: 'In a post-apocalyptic wasteland, Max helps a rebel warrior flee from a tyrannical leader.',
    posterUrl: posters.madMax,
  },
  {
    title: 'La La Land',
    genre: ['Romance', 'Drama', 'Musical'],
    year: 2016,
    description: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love.',
    posterUrl: posters.laLaLand,
  },
  {
    title: 'Get Out',
    genre: ['Horror', 'Thriller'],
    year: 2017,
    description: 'A young African-American visits his white girlfriend parents for the weekend, where simmering uneasiness builds to a twisted truth.',
    posterUrl: posters.getOut,
  },
  {
    title: 'Dune',
    genre: ['Sci-Fi', 'Adventure'],
    year: 2021,
    description: 'Paul Atreides leads a rebellion to restore his family noble house on the desert planet Arrakis.',
    posterUrl: posters.dune,
  },
];

async function run() {
  await connectDB();
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

  const inserted = [];
  for (const m of moviesData) {
    const doc = await Movie.create({ ...m, avgRating: 0, reviewCount: 0 });
    inserted.push(doc);
  }

  const sampleReviews = [
    { user: demo, movieIdx: 0, rating: 5, text: 'Mind-bending masterpiece. Nolan at his best!' },
    { user: critic, movieIdx: 0, rating: 4, text: 'Complex but rewarding. Great visuals.' },
    { user: demo, movieIdx: 1, rating: 5, text: 'Ledger Joker is iconic. Perfect comic book film.' },
    { user: critic, movieIdx: 1, rating: 5, text: 'Dark, gripping, and endlessly rewatchable.' },
    { user: demo, movieIdx: 2, rating: 5, text: 'Emotional sci-fi that sticks with you.' },
    { user: critic, movieIdx: 3, rating: 4, text: 'Sharp social satire with perfect pacing.' },
    { user: demo, movieIdx: 4, rating: 5, text: 'Pure magic. Miyazaki is a genius.' },
    { user: critic, movieIdx: 5, rating: 4, text: 'Wes Anderson whimsy overload—in a good way.' },
    { user: demo, movieIdx: 6, rating: 5, text: 'Non-stop adrenaline. Practical effects rock.' },
    { user: critic, movieIdx: 7, rating: 4, text: 'Charming and bittersweet. Great music.' },
    { user: demo, movieIdx: 8, rating: 4, text: 'Tense and clever. Peele nailed the tone.' },
    { user: critic, movieIdx: 9, rating: 5, text: 'Epic scale and gorgeous sound design.' },
    { user: admin, movieIdx: 2, rating: 3, text: 'Beautiful but the runtime is felt.' },
    { user: demo, movieIdx: 3, rating: 5, text: 'Best picture deserved. Unpredictable twists.' },
  ];

  let likeCounter = 0;
  for (const s of sampleReviews) {
    const movie = inserted[s.movieIdx];
    await Review.create({
      userId: s.user._id,
      movieId: movie._id,
      rating: s.rating,
      text: s.text,
      likes: likeCounter++ % 7,
      sentiment: sentimentFromRating(s.rating),
    });
  }

  for (const movie of inserted) {
    await recalculateMovieStats(movie._id);
  }

  admin.favorites = [inserted[0]._id, inserted[1]._id];
  demo.favorites = [inserted[2]._id, inserted[4]._id, inserted[7]._id];
  await admin.save();
  await demo.save();

  console.log('Seed complete.');
  console.log('Admin: admin@popscore.com / admin123');
  console.log('Demo: demo@popscore.com / demo123');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
