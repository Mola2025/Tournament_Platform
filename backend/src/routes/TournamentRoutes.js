const express = require("express");
const {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  joinTournament,
  leaveTournament,
} = require("../controllers/tournamentController");

const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// POST /tournaments
router.post("/", createTournament);

//* GET /tournaments
router.get("/", getTournaments);

//* GET /tournaments/:id
router.get("/:id", getTournamentById);

// POST /tournaments/:id/join
router.post("/:id/join", joinTournament);

// PATCH /tournaments/:id
router.patch("/:id", updateTournament);

//! DELETE /tournaments/:id
router.delete("/:id", deleteTournament);

//! DELETE /tournaments/:id/leave
router.delete("/:id/leave", leaveTournament);

module.exports = router;
