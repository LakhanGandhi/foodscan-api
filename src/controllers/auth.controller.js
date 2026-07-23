const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");
const env = require("../config/env");

const REFRESH_COOKIE = "refreshToken";

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
  };
}

const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  res.status(200).json({ success: true, data: { accessToken, user }, error: null });
});

const refresh = asyncHandler(async (req, res) => {
  const oldToken = req.cookies[REFRESH_COOKIE];
  const { accessToken, refreshToken, user } = await authService.refresh(oldToken);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  res.status(200).json({ success: true, data: { accessToken, user }, error: null });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });
  res.status(200).json({ success: true, data: { loggedOut: true }, error: null });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.status(200).json({
    success: true,
    data: {
      message: "If that email exists, a reset link has been issued.",
      ...(env.nodeEnv !== "production" ? result : {}), // resetToken visible only outside production
    },
    error: null,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  res.status(200).json({ success: true, data: { message: "Password updated. Please log in again." }, error: null });
});

const bootstrapSuperAdmin = asyncHandler(async (req, res) => {
  const admin = await authService.bootstrapSuperAdmin(req.body);
  res.status(201).json({ success: true, data: admin, error: null });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user }, error: null });
});

module.exports = { login, refresh, logout, forgotPassword, resetPassword, bootstrapSuperAdmin, me };
