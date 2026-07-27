const env = require("../config/env");

/**
 * Every error in the app ends up here (via next(err), thanks to
 * asyncHandler). This is the ONLY place that decides what error
 * shape goes back to the client - controllers never format errors
 * themselves.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // express.json() throws this specific shape when the request body isn't
  // valid JSON - treat it as a client error (400), not a server error (500).
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      data: null,
      error: { code: "INVALID_JSON", message: "Request body is not valid JSON." },
    });
  }

  // MongoDB duplicate-key error (from a unique index) - surface as a clean 409, not a 500.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(", ") || "field";
    return res.status(409).json({
      success: false,
      data: null,
      error: { code: "DUPLICATE_VALUE", message: `A record with that ${field} already exists.` },
    });
  }

  const statusCode = err.isApiError ? err.statusCode : 500;
  const code = err.isApiError ? err.code : "INTERNAL_SERVER_ERROR";
  const message = err.isApiError ? err.message : "Something went wrong. Please try again.";

  if (!err.isApiError) {
    // Unexpected errors get logged in full server-side, but never
    // leak internals (stack traces, DB details) to the client.
    console.error("[unhandled error]", err);
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(env.nodeEnv === "development" && !err.isApiError ? { stack: err.stack } : {}),
    },
  });
}

module.exports = errorHandler;
