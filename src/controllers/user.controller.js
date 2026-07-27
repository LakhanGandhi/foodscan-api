const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/user.service");

const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body, req.user, req.ip);
  res.status(201).json({ success: true, data: user, error: null });
});

const list = asyncHandler(async (req, res) => {
  const users = await userService.listUsers(req.companyScope);
  res.status(200).json({ success: true, data: users, error: null });
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id, req.companyScope);
  res.status(200).json({ success: true, data: user, error: null });
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user, req.companyScope, req.ip);
  res.status(200).json({ success: true, data: user, error: null });
});

const changeStatus = asyncHandler(async (req, res) => {
  const user = await userService.changeUserStatus(req.params.id, req.body.status, req.user, req.companyScope, req.ip);
  res.status(200).json({ success: true, data: user, error: null });
});

const resetPassword = asyncHandler(async (req, res) => {
  await userService.adminResetPassword(req.params.id, req.body.newPassword, req.user, req.companyScope, req.ip);
  res.status(200).json({ success: true, data: { message: "Password reset. User must log in again." }, error: null });
});

module.exports = { create, list, getById, update, changeStatus, resetPassword };
