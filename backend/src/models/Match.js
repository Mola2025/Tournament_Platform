const mongoose = require("mongoose");

const matchModel = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    player2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: String,
      default: "",
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "live", "finished"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const Match = mongoose.model("Match", matchModel);

module.exports = Match;
