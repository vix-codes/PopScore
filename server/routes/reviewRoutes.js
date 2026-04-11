const express = require("express");
const { addReview, getReviewsByMovie } = require("../controllers/reviewController");

const router = express.Router();

router.post("/", addReview);
router.get("/:movieId", getReviewsByMovie);

module.exports = router;
