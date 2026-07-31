function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function createBrandValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.companyId)) errors.push("companyId is required.");
  if (!isNonEmptyString(body.brandName)) errors.push("brandName is required.");
  return errors;
}

function updateBrandValidator(body) {
  const errors = [];
  if (body.status && !["active", "inactive"].includes(body.status)) {
    errors.push("status must be 'active' or 'inactive'.");
  }
  return errors;
}

module.exports = { createBrandValidator, updateBrandValidator };
