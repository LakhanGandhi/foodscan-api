const ROLES = require("../utils/roles");

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const ASSIGNABLE_ROLES = [ROLES.COMPANY_ADMIN, ROLES.COMPANY_EMPLOYEE]; // superAdmin is never assignable here

function createUserValidator(body) {
  const errors = [];
  if (!body.name || typeof body.name !== "string") errors.push("name is required.");
  if (!isValidEmail(body.email)) errors.push("A valid email is required.");
  if (!body.password || body.password.length < 8) errors.push("password must be at least 8 characters.");
  if (!ASSIGNABLE_ROLES.includes(body.role)) {
    errors.push(`role must be one of: ${ASSIGNABLE_ROLES.join(", ")}`);
  }
  return errors;
}

function updateUserValidator(body) {
  const errors = [];
  if (body.email && !isValidEmail(body.email)) errors.push("email must be a valid email address.");
  return errors;
}

function changeStatusValidator(body) {
  const errors = [];
  if (!["active", "disabled"].includes(body.status)) errors.push("status must be 'active' or 'disabled'.");
  return errors;
}

function resetPasswordValidator(body) {
  const errors = [];
  if (!body.newPassword || body.newPassword.length < 8) {
    errors.push("newPassword must be at least 8 characters.");
  }
  return errors;
}

module.exports = { createUserValidator, updateUserValidator, changeStatusValidator, resetPasswordValidator };
