import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    genre: [{ type: String, trim: true }],
    year: { type: Number, required: true },
    description: { type: String, required: true },
    posterUrl: { type: String, required: true },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Movie', movieSchema);
