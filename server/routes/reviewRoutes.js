const express = require("express");
const { getReviewsByMovieId, createReview } = require("../controllers/reviewController");

const router = express.Router();

router.get("/:movieId", getReviewsByMovieId);
router.post("/", createReview);

module.exports = router;
