/**
 * Loads and validates environment variables once, at boot.
 * Import `env` from here everywhere else in the app instead of
 * touching `process.env` directly — this is the single place that
 * knows what's required vs optional, and fails loudly if something
 * required is missing, rather than letting a missing secret cause
 * a confusing runtime error three layers deep later.
 */
require("dotenv").config();

const REQUIRED_VARS = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
];

function requireEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    // Intentionally fatal - a service should not start half-configured.
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}

requireEnv();

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5000,

  mongodbUri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || "foodcheck",

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "30d",
  },

  // Comma-separated list in .env, e.g. "https://foodcheck-admin.onrender.com,https://foodcheck.example.com"
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  ipHashSalt: process.env.IP_HASH_SALT || "change-this-salt",
};
