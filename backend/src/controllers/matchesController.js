const mongoose = require("mongoose");
const Match = require("../models/Match");
const User = require("../models/User");
const Tournament = require("../models/Tournament");

const matchPopulate = [
  { path: "player1", select: "_id username email" },
  { path: "player2", select: "_id username email" },
  { path: "winner", select: "_id username email" },
  { path: "tournamentId", select: "_id title" },
];

const createMatch = async (req, res) => {
  try {
    const { tournamentId, player1, player2, score, status } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // Validate required fields
    if (!tournamentId) {
      return res.status(400).json({ message: "Tournament ID is required." });
    }

    if (!player1) {
      return res.status(400).json({ message: "Player 1 is required." });
    }

    if (!player2) {
      return res.status(400).json({ message: "Player 2 is required." });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: "Invalid Tournament ID." });
    }

    if (!mongoose.Types.ObjectId.isValid(player1)) {
      return res.status(400).json({ message: "Invalid Player 1 ID." });
    }

    if (!mongoose.Types.ObjectId.isValid(player2)) {
      return res.status(400).json({ message: "Invalid Player 2 ID." });
    }

    // Validate that the tournament exists and that the user is the creator
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    const isCreator = tournament.createdBy.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Only the tournament creator or an admin can create matches.",
      });
    }

    // Validate that player1 exists
    const existingPlayer1 = await User.findById(player1).select("_id");
    if (!existingPlayer1) {
      return res.status(404).json({ message: "Player 1 not found." });
    }

    // Validate that player2 exists
    const existingPlayer2 = await User.findById(player2).select("_id");
    if (!existingPlayer2) {
      return res.status(404).json({ message: "Player 2 not found." });
    }

    const match = await Match.create({
      tournamentId,
      player1,
      player2,
      score,
      status,
    });
    await match.populate(matchPopulate);

    return res.status(201).json({
      message: "Match created successfully.",
      data: { match },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error while creating match." });
  }
};

const getMatches = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const matches = await Match.find()
      .populate(matchPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Matches fetched successfully.",
      data: { matches },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error while fetching matches." });
  }
};

const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Match ID." });
    }

    const match = await Match.findById(id).populate(matchPopulate);

    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    return res.status(200).json({
      message: "Match fetched successfully.",
      data: { match },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error while fetching match." });
  }
};

const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, winner, status } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Match ID." });
    }

    const match = await Match.findById(id);

    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    const finalStatus = "status" in req.body ? status : match.status;

    // Not allowing winner to be set if status is not finished
    if ("winner" in req.body && finalStatus !== "finished") {
      return res.status(400).json({
        message: "Winner can only be set when match status is 'finished'.",
      });
    }

    // Cannot set status to finished without a winner
    if (
      "status" in req.body &&
      status === "finished" &&
      !winner &&
      !match.winner
    ) {
      return res.status(400).json({
        message: "Cannot set status to finished without a winner.",
      });
    }

    // Validate winner: must be player1 or player2
    if ("winner" in req.body && winner !== null && winner !== "") {
      if (!mongoose.Types.ObjectId.isValid(winner)) {
        return res.status(400).json({ message: "Invalid winner ID." });
      }

      const isPlayer1 = match.player1.toString() === winner;
      const isPlayer2 = match.player2.toString() === winner;

      if (!isPlayer1 && !isPlayer2) {
        return res.status(400).json({
          message: "Winner must be one of the match players.",
        });
      }
    }

    const updateData = {};

    if ("score" in req.body) updateData.score = score;
    if ("winner" in req.body) updateData.winner = winner || null;
    if ("status" in req.body) updateData.status = status;

    if ("winner" in req.body && winner) {
      updateData.status = "finished";
    }

    const updatedMatch = await Match.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate(matchPopulate);

    return res.status(200).json({
      message: "Match updated successfully.",
      data: { match: updatedMatch },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error while updating match." });
  }
};

const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Match ID." });
    }

    const match = await Match.findById(id);

    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    await match.deleteOne();

    return res.status(200).json({
      message: "Match deleted successfully.",
      data: { match },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error while deleting match." });
  }
};

module.exports = {
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
};
