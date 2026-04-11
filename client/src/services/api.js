const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}

export function getMovies(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request(`/movies${suffix}`);
}

export function getMovieById(id) {
  return request(`/movies/${id}`);
}

export function getReviews(movieId) {
  return request(`/reviews?movieId=${movieId}`);
}

export function getReviewsByMovieId(movieId) {
  return getReviews(movieId);
}

export function createReview(payload, token) {
  return request("/reviews", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function updateReview(reviewId, payload, token) {
  return request(`/reviews/${reviewId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload)
  });
}

export function deleteReview(reviewId, token) {
  return request(`/reviews/${reviewId}`, {
    method: "DELETE",
    token
  });
}

export function signupUser(payload) {
  return request("/users/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function loginUser(payload) {
  return request("/users/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCurrentUser(token) {
  return request("/users/me", { token });
}

export function createMovie(payload, token) {
  return request("/movies", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function updateMovie(movieId, payload, token) {
  return request(`/movies/${movieId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload)
  });
}

export function deleteMovieById(movieId, token) {
  return request(`/movies/${movieId}`, {
    method: "DELETE",
    token
  });
}
