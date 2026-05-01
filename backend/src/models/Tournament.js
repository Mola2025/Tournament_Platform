const mongoose = require("mongoose");

const tournamentModel = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    game: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    players: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["open", "ongoing", "finished"],
      default: "open",
    },
  },
  {
    timestamps: true,
  },
);

const Tournament = mongoose.model("Tournament", tournamentModel);

module.exports = Tournament;
