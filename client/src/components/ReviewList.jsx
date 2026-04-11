import StarRating from "./StarRating";

function ReviewList({ reviews = [] }) {
  if (reviews.length === 0) {
    return <p>No reviews yet.</p>;
  }

  return (
    <ul>
      {reviews.map((review) => (
        <li key={review.id}>
          <strong>{review.author}</strong>: {review.comment} <StarRating rating={review.rating} />
        </li>
      ))}
    </ul>
  );
}

export default ReviewList;
