const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ---- security & parsing ----
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow no-origin requests (server-to-server, curl, health checks)
      // and anything explicitly listed in CORS_ORIGINS.
      if (!origin || env.corsOrigins.length === 0 || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

if (env.nodeEnv !== "test") {
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
}

// ---- rate limiting (general baseline; auth-specific limits come with the Auth module) ----
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ---- routes ----
app.use("/api/v1", routes);

// ---- 404 + centralized error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
