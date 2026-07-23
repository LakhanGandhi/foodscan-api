const ApiError = require("../utils/ApiError");

/**
 * Usage: router.post("/companies", authenticate, authorize(ROLES.SUPER_ADMIN), controller.create)
 */
function authorize(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action."));
    }
    next();
  };
}

module.exports = authorize;
