const movies = [
  {
    id: "1",
    title: "Inception",
    rating: 4.7,
    description: "A thief steals secrets through dream-sharing technology."
  },
  {
    id: "2",
    title: "Interstellar",
    rating: 4.8,
    description: "A team travels through a wormhole to save humanity."
  },
  {
    id: "3",
    title: "The Dark Knight",
    rating: 4.9,
    description: "Batman faces chaos unleashed by the Joker in Gotham."
  }
];

const reviews = [
  { id: "101", movieId: "1", author: "Asha", comment: "Mind-bending and brilliant.", rating: 5 },
  { id: "102", movieId: "1", author: "Rahul", comment: "A little complex but great.", rating: 4 },
  { id: "103", movieId: "2", author: "Maya", comment: "Emotional and visually stunning.", rating: 5 }
];

module.exports = { movies, reviews };
