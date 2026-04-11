function StarRating({ rating = 0 }) {
  const safeRating = Number(rating) || 0;
  const fullStars = Math.round(safeRating);
  return <span>{`${"*".repeat(fullStars)}${"-".repeat(5 - fullStars)} (${safeRating})`}</span>;
}

export default StarRating;
