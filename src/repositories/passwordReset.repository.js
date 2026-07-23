const PasswordReset = require("../models/PasswordReset");

function create({ userId, tokenHash, expiresAt }) {
  return PasswordReset.create({ userId, tokenHash, expiresAt });
}

function findByHash(tokenHash) {
  return PasswordReset.findOne({ tokenHash });
}

function markUsed(id) {
  return PasswordReset.findByIdAndUpdate(id, { used: true });
}

module.exports = { create, findByHash, markUsed };
