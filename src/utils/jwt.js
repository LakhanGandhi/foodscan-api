const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * These are intentionally generic - they sign/verify whatever payload
 * object you give them. The Authentication module will decide what
 * goes in the payload (userId, role, companyId); this layer doesn't
 * need to know that yet.
 */

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiry });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiry });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
