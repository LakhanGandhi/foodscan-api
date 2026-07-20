/**
 * Throw this from services/controllers instead of a bare Error whenever
 * the failure has a known HTTP status and a machine-readable code the
 * frontend can branch on (e.g. "VALIDATION_ERROR", "NOT_FOUND").
 *
 * Example:
 *   throw new ApiError(404, "COMPANY_NOT_FOUND", "No company exists with that ID.");
 */
class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isApiError = true;
  }
}

module.exports = ApiError;
