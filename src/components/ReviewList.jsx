const FULL_STAR = "\u2605";
const EMPTY_STAR = "\u2606";

function formatStars(rating) {
  return FULL_STAR.repeat(rating) + EMPTY_STAR.repeat(5 - rating);
}

function ReviewList({ reviews, sortBy, onSortChange }) {
  return (
    <section className="review-list">
      <div className="review-list-head">
        <div>
          <p className="eyebrow">Reviews</p>
          <h2>User opinions</h2>
        </div>

        <label className="sort-control" htmlFor="review-sort">
          <span>Sort by</span>
          <select
            id="review-sort"
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
          </select>
        </label>
      </div>

      {!reviews.length ? (
        <div className="empty-state">No reviews yet.</div>
      ) : (
        <div className="review-stack">
          {reviews.map((review) => (
            <article className="review-card" key={review._id}>
              <div className="review-head">
                <div>
                  <p className="review-author">{review.userName || "Anonymous user"}</p>
                  <p className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="review-stars">{formatStars(review.rating)}</span>
              </div>

              <p>{review.text}</p>

              <div className="review-footer">
                <span className="review-helpful">
                  Helpful ({review.helpful || 0})
                </span>
                <div className="review-links">
                  <button type="button">Reply</button>
                  <button type="button">Edit</button>
                  <button type="button">Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ReviewList;
