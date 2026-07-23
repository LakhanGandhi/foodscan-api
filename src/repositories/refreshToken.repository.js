const RefreshToken = require("../models/RefreshToken");

function create({ userId, tokenHash, expiresAt }) {
  return RefreshToken.create({ userId, tokenHash, expiresAt });
}

function findByHash(tokenHash) {
  return RefreshToken.findOne({ tokenHash });
}

function revoke(id) {
  return RefreshToken.findByIdAndUpdate(id, { revoked: true });
}

function revokeAllForUser(userId) {
  return RefreshToken.updateMany({ userId }, { revoked: true });
}

module.exports = { create, findByHash, revoke, revokeAllForUser };
