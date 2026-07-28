const crypto = require("crypto");
const env = require("../config/env");

/**
 * Rough visitor fingerprint (IP + User-Agent, hashed) used only to
 * approximate unique vs. returning scans. Not stored raw, not tied
 * to any account - reuses the same salt as the old IP hashing.
 */
function hashVisitor(ip, userAgent) {
  return crypto.createHash("sha256").update(env.ipHashSalt + ip + "|" + (userAgent || "")).digest("hex");
}

module.exports = hashVisitor;
