const mongoose = require("mongoose");

function getHealth(req, res) {
  const dbStateMap = ["disconnected", "connected", "connecting", "disconnecting"];
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
      db: dbStateMap[mongoose.connection.readyState] || "unknown",
    },
    error: null,
  });
}

module.exports = { getHealth };
