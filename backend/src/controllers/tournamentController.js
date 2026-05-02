const mongoose = require("mongoose");
const Tournament = require("../models/Tournament");

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

module.exports = {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
};
