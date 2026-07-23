function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function loginValidator(body) {
  const errors = [];
  if (!isValidEmail(body.email)) errors.push("A valid email is required.");
  if (!body.password || typeof body.password !== "string") errors.push("Password is required.");
  return errors;
}

function forgotPasswordValidator(body) {
  const errors = [];
  if (!isValidEmail(body.email)) errors.push("A valid email is required.");
  return errors;
}

function resetPasswordValidator(body) {
  const errors = [];
  if (!body.token || typeof body.token !== "string") errors.push("Reset token is required.");
  if (!body.newPassword || body.newPassword.length < 8) {
    errors.push("New password must be at least 8 characters.");
  }
  return errors;
}

function bootstrapValidator(body) {
  const errors = [];
  if (!body.name || typeof body.name !== "string") errors.push("Name is required.");
  if (!isValidEmail(body.email)) errors.push("A valid email is required.");
  if (!body.password || body.password.length < 8) errors.push("Password must be at least 8 characters.");
  if (!body.bootstrapSecret) errors.push("bootstrapSecret is required.");
  return errors;
}

module.exports = { loginValidator, forgotPasswordValidator, resetPasswordValidator, bootstrapValidator };
