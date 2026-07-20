const env = require("../config/env");

/**
 * Every error in the app ends up here (via next(err), thanks to
 * asyncHandler). This is the ONLY place that decides what error
 * shape goes back to the client - controllers never format errors
 * themselves.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
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
