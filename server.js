const env = require("./src/config/env");
const { connectDB } = require("./src/config/db");
const app = require("./src/app");

let server;

async function start() {
  await connectDB();
  server = app.listen(env.port, () => {
    console.log(`[foodcheck-api] listening on port ${env.port} (${env.nodeEnv})`);
  });
}

function shutdown(signal) {
  console.log(`[foodcheck-api] received ${signal}, shutting down gracefully...`);
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start().catch((err) => {
  console.error("[foodcheck-api] failed to start:", err.message);
  process.exit(1);
});
