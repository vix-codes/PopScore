const BASE_URL = "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export function getMovies() {
  return request("/movies");
}

export function getMovieById(id) {
  return request(`/movies/${id}`);
}

export function getReviewsByMovieId(movieId) {
  return request(`/reviews/${movieId}`);
}

export function postReview(reviewPayload) {
  return request("/reviews", {
    method: "POST",
    body: JSON.stringify(reviewPayload)
  });
}
