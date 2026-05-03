const mongoose = require("mongoose");
const Tournament = require("../models/Tournament");
const {
  emitPlayerJoinedTournament,
  emitGlobalAlert,
} = require("../sockets/socket");

const tournamentPopulate = [
  { path: "players", select: "_id username email" },
  { path: "createdBy", select: "_id name email" },
];

const createTournament = async (req, res) => {
  try {
    const { title, game, description, status } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    const tournament = await Tournament.create({
      title,
      game,
      description,
      status,
      createdBy: req.user.id,
    });
    await tournament.populate(tournamentPopulate);

    return res.status(201).json({
      message: "Tournament created successfully.",
      data: { tournament },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while creating tournament." });
  }
};

const getTournaments = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    let query = {};

    if (req.query.filter === "created") {
      query.createdBy = req.user.id;
    } else if (req.query.filter === "joined") {
      query.players = req.user.id;
    }

    const tournaments = await Tournament.find(query)
      .populate(tournamentPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Tournaments fetched successfully.",
      data: { tournaments },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while fetching tournaments." });
  }
};

const getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Tournament Id." });
    }

    const tournament =
      await Tournament.findById(id).populate(tournamentPopulate);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    return res.status(200).json({
      message: "Tournament fetched successfully.",
      data: { tournament },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while fetching tournament." });
  }
};

const updateTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, game, description, status, players } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Tournament Id." });
    }

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    if (tournament.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the tournament creator can edit this tournament.",
      });
    }

    const updateData = {};

    if ("title" in req.body) updateData.title = title;
    if ("game" in req.body) updateData.game = game;
    if ("description" in req.body) updateData.description = description;
    if ("status" in req.body) updateData.status = status;
    if ("players" in req.body) updateData.players = players;

    const updatedTournament = await Tournament.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).populate(tournamentPopulate);

    // Emit global alert if tournament status changed to ongoing
    if ("status" in req.body && status === "ongoing") {
      emitGlobalAlert(updatedTournament.title);
    }

    return res.status(200).json({
      message: "Tournament updated successfully.",
      data: { tournament: updatedTournament },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while updating tournament." });
  }
};

const deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Tournament Id." });
    }

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    if (tournament.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the tournament creator can delete this tournament.",
      });
    }

    await tournament.deleteOne();

    return res.status(200).json({
      message: "Tournament deleted successfully.",
      data: { tournament },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while deleting tournament." });
  }
};

const joinTournament = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Tournament Id." });
    }

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    if (tournament.createdBy.toString() === req.user.id) {
      return res.status(400).json({
        message:
          "You are the creator of this tournament and cannot join as a player.",
      });
    }

    if (tournament.status !== "open") {
      return res
        .status(400)
        .json({ message: "Tournament is not open for registration." });
    }

    const alreadyJoined = tournament.players.some(
      (playerId) => playerId.toString() === req.user.id,
    );

    if (alreadyJoined) {
      return res
        .status(400)
        .json({ message: "You already joined this tournament." });
    }

    tournament.players.push(req.user.id);
    await tournament.save();
    await tournament.populate(tournamentPopulate);

    // Emit player joined tournament event
    emitPlayerJoinedTournament(req.user, tournament);

    return res.status(200).json({
      message: "Joined tournament successfully.",
      data: { tournament },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error while joining tournament." });
  }
};

const leaveTournament = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Tournament Id." });
    }

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    const playerIndex = tournament.players.findIndex(
      (playerId) => playerId.toString() === req.user.id,
    );
    if (playerIndex === -1) {
      return res
        .status(400)
        .json({ message: "You are not registered for this tournament." });
    }

    tournament.players.splice(playerIndex, 1);
    await tournament.save();
    await tournament.populate(tournamentPopulate);

    return res.status(200).json({
      message: "You have left the tournament successfully.",
      data: { tournament },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error while attempting to leave the tournament." });
  }
};

module.exports = {
  createTournament,
  getTournaments,
  getTournamentById,
  joinTournament,
  leaveTournament,
  updateTournament,
  deleteTournament,
};
