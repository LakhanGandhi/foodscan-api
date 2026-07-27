require("dotenv").config();

const REQUIRED_VARS = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "BOOTSTRAP_SECRET",
];

function requireEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}

requireEnv();

if (!process.env.PUBLIC_SITE_BASE_URL) {
  console.warn(
    "[env] PUBLIC_SITE_BASE_URL is not set - QR codes will encode a placeholder URL until foodcheck-public is deployed and this is configured."
  );
}

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

  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  ipHashSalt: process.env.IP_HASH_SALT || "change-this-salt",
  bootstrapSecret: process.env.BOOTSTRAP_SECRET,

  // Used to build the URL encoded inside every QR code: {publicSiteBaseUrl}?id={productId}
  publicSiteBaseUrl: process.env.PUBLIC_SITE_BASE_URL || "https://your-public-site.example.com",
};
