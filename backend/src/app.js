const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/AuthenticationRoutes");
const tournamentRoutes = require("./routes/TournamentRoutes");
const matchRoutes = require("./routes/MatchesRoutes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/tournaments", tournamentRoutes);
app.use("/matches", matchRoutes);

module.exports = app;
