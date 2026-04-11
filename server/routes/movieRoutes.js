const express = require("express");
const {
  listMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} = require("../controllers/movieController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", listMovies);
router.get("/:id", getMovieById);
router.post("/", requireAuth, requireAdmin, createMovie);
router.put("/:id", requireAuth, requireAdmin, updateMovie);
router.delete("/:id", requireAuth, requireAdmin, deleteMovie);

module.exports = router;
