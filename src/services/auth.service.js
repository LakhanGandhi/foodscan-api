const crypto = require("crypto");
const ApiError = require("../utils/ApiError");
const { hashPassword, comparePassword } = require("../utils/password");
const hashToken = require("../utils/hashToken");
const parseDurationToMs = require("../utils/parseDuration");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const generateId = require("../utils/idGenerator");
const ROLES = require("../utils/roles");
const env = require("../config/env");

const userRepo = require("../repositories/user.repository");
const refreshTokenRepo = require("../repositories/refreshToken.repository");
const passwordResetRepo = require("../repositories/passwordReset.repository");

function toPublicUser(user) {
  return { id: user._id, email: user.email, name: user.name, role: user.role, companyId: user.companyId, isOwner: user.isOwner };
}

function buildTokenPayload(user) {
  return { userId: user._id, role: user.role, companyId: user.companyId, isOwner: user.isOwner };
}

async function issueTokens(user) {
  const accessToken = signAccessToken(buildTokenPayload(user));
  const refreshToken = signRefreshToken(buildTokenPayload(user));
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.jwt.refreshExpiry));
  await refreshTokenRepo.create({ userId: user._id, tokenHash: hashToken(refreshToken), expiresAt });
  return { accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new ApiError(401, "INVALID_CREDENTIALS", "Incorrect email or password.");
  if (user.status !== "active") throw new ApiError(403, "ACCOUNT_DISABLED", "This account has been disabled.");

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) throw new ApiError(401, "INVALID_CREDENTIALS", "Incorrect email or password.");

  const tokens = await issueTokens(user);
  await userRepo.updateLastLogin(user._id);

  return { ...tokens, user: toPublicUser(user) };
}

async function refresh(oldRefreshToken) {
  if (!oldRefreshToken) throw new ApiError(401, "NO_REFRESH_TOKEN", "No refresh token provided.");

  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch (err) {
    throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired.");
  }

  const stored = await refreshTokenRepo.findByHash(hashToken(oldRefreshToken));
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid, expired, or already used.");
  }

  const user = await userRepo.findById(payload.userId);
  if (!user || user.status !== "active") {
    throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Account no longer active.");
  }

  await refreshTokenRepo.revoke(stored._id);
  const tokens = await issueTokens(user);

  return { ...tokens, user: toPublicUser(user) };
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  const stored = await refreshTokenRepo.findByHash(hashToken(refreshToken));
  if (stored) await refreshTokenRepo.revoke(stored._id);
}

async function forgotPassword(email) {
  const user = await userRepo.findByEmail(email);
  if (!user) return { resetToken: null };

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await passwordResetRepo.create({ userId: user._id, tokenHash: hashToken(resetToken), expiresAt });

  return { resetToken };
}

async function resetPassword({ token, newPassword }) {
  const stored = await passwordResetRepo.findByHash(hashToken(token));
  if (!stored || stored.used || stored.expiresAt < new Date()) {
    throw new ApiError(400, "INVALID_RESET_TOKEN", "This reset link is invalid or has expired.");
  }
  const user = await userRepo.findById(stored.userId);
  if (!user) throw new ApiError(400, "INVALID_RESET_TOKEN", "This reset link is invalid.");

  user.passwordHash = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save();
  await passwordResetRepo.markUsed(stored._id);
  await refreshTokenRepo.revokeAllForUser(user._id);
}

async function bootstrapSuperAdmin({ name, email, password, bootstrapSecret }) {
  if (bootstrapSecret !== env.bootstrapSecret) {
    throw new ApiError(403, "FORBIDDEN", "Invalid bootstrap secret.");
  }
  const existingCount = await userRepo.countByRole(ROLES.SUPER_ADMIN);
  if (existingCount > 0) {
    throw new ApiError(403, "ALREADY_BOOTSTRAPPED", "A Super Admin already exists. This endpoint is now disabled.");
  }
  const passwordHash = await hashPassword(password);
  const user = await userRepo.create({
    _id: generateId("USR"),
    companyId: null,
    email,
    passwordHash,
    name,
    role: ROLES.SUPER_ADMIN,
    status: "active",
    isOwner: true, // the one and only owner - created once, here, never again
  });
  return toPublicUser(user);
}

module.exports = { login, refresh, logout, forgotPassword, resetPassword, bootstrapSuperAdmin };
