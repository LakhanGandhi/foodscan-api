/**
 * Parses simple duration strings like "15m", "30d", "1h", "45s" into
 * milliseconds. Only supports single-unit values, which is all the
 * JWT_ACCESS_EXPIRY / JWT_REFRESH_EXPIRY env vars ever need.
 */
function parseDurationToMs(str) {
  const match = /^(\d+)([smhd])$/.exec(str);
  if (!match) throw new Error(`Invalid duration string: "${str}" (expected e.g. "30d", "15m")`);
  const value = parseInt(match[1], 10);
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[match[2]];
}

module.exports = parseDurationToMs;
