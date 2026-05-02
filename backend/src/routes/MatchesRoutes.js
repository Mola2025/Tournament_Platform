const express = require("express");
const {
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
} = require("../controllers/matchesController");

const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// POST /matches
router.post("/", createMatch);

// GET /matches
router.get("/", getMatches);

// GET /matches/:id
router.get("/:id", getMatchById);

// PATCH /matches/:id
router.patch("/:id", updateMatch);

// DELETE /matches/:id
router.delete("/:id", deleteMatch);

module.exports = router;
