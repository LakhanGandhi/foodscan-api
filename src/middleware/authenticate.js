const ApiError = require("../utils/ApiError");
const { verifyAccessToken } = require("../utils/jwt");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "AUTH_REQUIRED", "Authentication required."));
  }
  try {
    req.user = verifyAccessToken(token); // { userId, role, companyId }
    next();
  } catch (err) {
    next(new ApiError(401, "INVALID_TOKEN", "Access token is invalid or expired."));
  }
}

module.exports = authenticate;
