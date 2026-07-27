const ApiError = require("../utils/ApiError");
const generateId = require("../utils/idGenerator");
const { hashPassword } = require("../utils/password");
const ROLES = require("../utils/roles");

const userRepo = require("../repositories/user.repository");
const companyRepo = require("../repositories/company.repository");
const refreshTokenRepo = require("../repositories/refreshToken.repository");
const auditLogRepo = require("../repositories/auditLog.repository");

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
  };
}

function assertAccess(targetUser, companyScope) {
  if (companyScope && targetUser.companyId !== companyScope) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this user.");
  }
}

async function createUser(data, actorUser, ip) {
  let companyId;

  if (actorUser.role === ROLES.COMPANY_ADMIN) {
    if (data.role !== ROLES.COMPANY_EMPLOYEE) {
      throw new ApiError(403, "FORBIDDEN", "Company Admin can only create Employee accounts.");
    }
    companyId = actorUser.companyId;
  } else {
    // Super Admin
    companyId = data.companyId;
    if (!companyId) throw new ApiError(400, "VALIDATION_ERROR", "companyId is required.");
    const company = await companyRepo.findById(companyId);
    if (!company) throw new ApiError(400, "INVALID_COMPANY", "No company exists with that companyId.");
  }

  const existing = await userRepo.findByEmail(data.email);
  if (existing) throw new ApiError(409, "EMAIL_IN_USE", "A user with that email already exists.");

  const passwordHash = await hashPassword(data.password);
  const user = await userRepo.create({
    _id: generateId("USR"),
    companyId,
    email: data.email,
    passwordHash,
    name: data.name,
    role: data.role,
    status: "active",
  });

  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "user.create",
    entityType: "User",
    entityId: user._id,
    oldValue: null,
    newValue: { name: user.name, email: user.email, role: user.role, companyId: user.companyId },
    ip,
  });

  return toPublicUser(user);
}

async function listUsers(companyScope) {
  const users = await userRepo.findAll(companyScope);
  return users.map(toPublicUser);
}

async function getUserById(id, companyScope) {
  const user = await userRepo.findById(id);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "No user exists with that ID.");
  assertAccess(user, companyScope);
  return toPublicUser(user);
}

async function updateUser(id, updates, actorUser, companyScope, ip) {
  const existing = await userRepo.findById(id);
  if (!existing) throw new ApiError(404, "USER_NOT_FOUND", "No user exists with that ID.");
  assertAccess(existing, companyScope);

  // Only name/email are editable here - role, companyId, password, and
  // status all have their own dedicated, more carefully guarded actions.
  const safeUpdates = {};
  if (updates.name !== undefined) safeUpdates.name = updates.name;
  if (updates.email !== undefined) safeUpdates.email = updates.email;

  const oldValue = { name: existing.name, email: existing.email };
  const updated = await userRepo.updateById(id, safeUpdates);

  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "user.update",
    entityType: "User",
    entityId: id,
    oldValue,
    newValue: { name: updated.name, email: updated.email },
    ip,
  });
  return toPublicUser(updated);
}

async function changeUserStatus(id, status, actorUser, companyScope, ip) {
  const existing = await userRepo.findById(id);
  if (!existing) throw new ApiError(404, "USER_NOT_FOUND", "No user exists with that ID.");
  assertAccess(existing, companyScope);

  if (actorUser.role === ROLES.COMPANY_ADMIN && existing.role !== ROLES.COMPANY_EMPLOYEE) {
    throw new ApiError(403, "FORBIDDEN", "Company Admin can only manage Employee accounts.");
  }

  const updated = await userRepo.updateById(id, { status });

  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "user.status_change",
    entityType: "User",
    entityId: id,
    oldValue: { status: existing.status },
    newValue: { status: updated.status },
    ip,
  });
  return toPublicUser(updated);
}

async function adminResetPassword(id, newPassword, actorUser, companyScope, ip) {
  const existing = await userRepo.findById(id);
  if (!existing) throw new ApiError(404, "USER_NOT_FOUND", "No user exists with that ID.");
  assertAccess(existing, companyScope);

  if (actorUser.role === ROLES.COMPANY_ADMIN && existing.role !== ROLES.COMPANY_EMPLOYEE) {
    throw new ApiError(403, "FORBIDDEN", "Company Admin can only reset passwords for Employee accounts.");
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepo.updateById(id, { passwordHash });
  await refreshTokenRepo.revokeAllForUser(id); // force re-login everywhere after an admin-initiated reset

  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "user.password_reset_by_admin",
    entityType: "User",
    entityId: id,
    oldValue: null,
    newValue: null, // never record password/hash values
    ip,
  });
}

module.exports = { createUser, listUsers, getUserById, updateUser, changeUserStatus, adminResetPassword };
