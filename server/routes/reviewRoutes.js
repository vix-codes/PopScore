const express = require("express");
const router = express.Router();

const {
  addReview,
  getReviewsByMovie,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

router.post("/", addReview);
router.get("/:movieId", getReviewsByMovie);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

module.exports = router;
