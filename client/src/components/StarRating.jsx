function StarRating({ rating = 0 }) {
  const fullStars = Math.round(rating);
  return <span>{`${"★".repeat(fullStars)}${"☆".repeat(5 - fullStars)} (${rating})`}</span>;
}

export default StarRating;
