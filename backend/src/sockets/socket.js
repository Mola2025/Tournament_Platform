const { Server } = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.emit("socket:ready", {
      message: "Websocket connection established.",
    });
  });

  return io;
};

// Match
const emitMatchScoreUpdate = (match) => {
  if (!io) return;

  io.emit("match:score-update", {
    message: "Match score updated.",
    data: { match },
  });
};

const emitMatchStatusChange = (match) => {
  if (!io) return;

  io.emit("match:status-change", {
    message: "Match status changed.",
    data: { match },
  });
};

// Tournament

const emitPlayerJoinedTournament = (player, tournament) => {
  if (!io) return;

  io.emit("tournament:player-joined", {
    message: `${player.name} joined the tournament.`,
    data: { player, tournament },
  });
};

const emitGlobalAlert = (tournamentName) => {
  if (!io) return;

  io.emit("notification:global-alert", {
    message: `The tournament "${tournamentName}" has started!`,
  });
};

module.exports = {
  initializeSocket,
  emitMatchScoreUpdate,
  emitMatchStatusChange,
  emitPlayerJoinedTournament,
  emitGlobalAlert,
};
