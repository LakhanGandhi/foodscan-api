const ApiError = require("../utils/ApiError");

function validate(validatorFn) {
  return function (req, res, next) {
    const errors = validatorFn(req.body || {});
    if (errors.length > 0) {
      return next(new ApiError(400, "VALIDATION_ERROR", errors.join(" ")));
    }
    next();
  };
}

module.exports = validate;
