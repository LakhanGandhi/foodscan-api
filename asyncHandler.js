/**
 * Wrap every async controller with this instead of writing try/catch
 * in each one. Any thrown error (or rejected promise) gets forwarded
 * to the centralized error handler via next(err).
 *
 * Example:
 *   router.get("/health", asyncHandler(healthController.getHealth));
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
