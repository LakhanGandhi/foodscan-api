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

const INACTIVITY_DISABLE_DAYS = 45;
const PASSWORD_EXPIRY_DAYS = 30;
const PASSWORD_WARNING_START_DAYS = 20;

function daysSince(date) {
  return (Date.now() - new Date(date).getTime()) / 86400000;
}

function toPublicUser(user, extra = {}) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
    isOwner: user.isOwner,
    ...extra,
  };
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

  // 45-day inactivity rule - checked only after credentials are confirmed correct,
  // so a wrong-password guess can never be used to force-disable someone's account.
  if (user.lastLoginAt && daysSince(user.lastLoginAt) > INACTIVITY_DISABLE_DAYS) {
    user.status = "disabled";
    await user.save();
    throw new ApiError(
      403,
      "ACCOUNT_DISABLED_INACTIVITY",
      "This account was disabled due to 45+ days of inactivity. Please contact your administrator."
    );
  }

  // 30-day password expiry rule.
  const passwordAgeDays = daysSince(user.passwordChangedAt || user.createdAt);
  if (passwordAgeDays > PASSWORD_EXPIRY_DAYS) {
    throw new ApiError(
      403,
      "PASSWORD_EXPIRED",
      "Your password has expired. Please contact your administrator to reset it."
    );
  }

  const tokens = await issueTokens(user);
  await userRepo.updateLastLogin(user._id);

  const passwordWarning = passwordAgeDays >= PASSWORD_WARNING_START_DAYS;
  const passwordDaysRemaining = Math.max(0, Math.ceil(PASSWORD_EXPIRY_DAYS - passwordAgeDays));

  return { ...tokens, user: toPublicUser(user, { passwordWarning, passwordDaysRemaining }) };
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

  const passwordAgeDays = daysSince(user.passwordChangedAt || user.createdAt);
  const passwordWarning = passwordAgeDays >= PASSWORD_WARNING_START_DAYS;
  const passwordDaysRemaining = Math.max(0, Math.ceil(PASSWORD_EXPIRY_DAYS - passwordAgeDays));

  return { ...tokens, user: toPublicUser(user, { passwordWarning, passwordDaysRemaining }) };
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
    isOwner: true,
  });
  return toPublicUser(user);
}

module.exports = { login, refresh, logout, forgotPassword, resetPassword, bootstrapSuperAdmin };
