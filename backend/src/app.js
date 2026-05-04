const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/AuthenticationRoutes");
const tournamentRoutes = require("./routes/TournamentRoutes");
const matchRoutes = require("./routes/MatchesRoutes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/tournaments", tournamentRoutes);
app.use("/matches", matchRoutes);

// To fix the issue that the navbar is was showing and now the frontend is not showing, we need to serve the frontend from the backend
const frontendPath = path.join(__dirname, "../frontend/dist/frontend/browser");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

module.exports = app;
