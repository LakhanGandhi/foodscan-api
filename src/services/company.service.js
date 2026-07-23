const ApiError = require("../utils/ApiError");
const generateId = require("../utils/idGenerator");
const { hashPassword } = require("../utils/password");
const ROLES = require("../utils/roles");

const companyRepo = require("../repositories/company.repository");
const userRepo = require("../repositories/user.repository");
const auditLogRepo = require("../repositories/auditLog.repository");

function assertAccess(company, companyScope) {
  // companyScope is null for Super Admin (no restriction).
  if (companyScope && company._id !== companyScope) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this company.");
  }
}

async function createCompany(data, actorUserId, ip) {
  const company = await companyRepo.create({ ...data, createdBy: actorUserId });
  await auditLogRepo.record({
    actorUserId,
    action: "company.create",
    entityType: "Company",
    entityId: company._id,
    oldValue: null,
    newValue: company.toObject(),
    ip,
  });
  return company;
}

async function listCompanies() {
  // Only reachable by Super Admin (enforced at the route level) - no scoping needed.
  return companyRepo.findAll();
}

async function getCompanyById(id, companyScope) {
  const company = await companyRepo.findById(id);
  if (!company) throw new ApiError(404, "COMPANY_NOT_FOUND", "No company exists with that ID.");
  assertAccess(company, companyScope);
  return company;
}

async function updateCompany(id, updates, actorUserId, companyScope, ip) {
  const existing = await companyRepo.findById(id);
  if (!existing) throw new ApiError(404, "COMPANY_NOT_FOUND", "No company exists with that ID.");
  assertAccess(existing, companyScope);

  const oldValue = existing.toObject();
  const updated = await companyRepo.updateById(id, updates);

  await auditLogRepo.record({
    actorUserId,
    action: "company.update",
    entityType: "Company",
    entityId: id,
    oldValue,
    newValue: updated.toObject(),
    ip,
  });
  return updated;
}

async function changeCompanyStatus(id, status, actorUserId, ip) {
  // Super Admin only (enforced at route level) - no scoping needed.
  const existing = await companyRepo.findById(id);
  if (!existing) throw new ApiError(404, "COMPANY_NOT_FOUND", "No company exists with that ID.");

  const oldValue = existing.toObject();
  const updated = await companyRepo.updateById(id, { status });

  await auditLogRepo.record({
    actorUserId,
    action: "company.status_change",
    entityType: "Company",
    entityId: id,
    oldValue: { status: oldValue.status },
    newValue: { status: updated.status },
    ip,
  });
  return updated;
}

async function deleteCompany(id, actorUserId, ip) {
  const existing = await companyRepo.findById(id);
  if (!existing) throw new ApiError(404, "COMPANY_NOT_FOUND", "No company exists with that ID.");

  await companyRepo.deleteById(id);
  await auditLogRepo.record({
    actorUserId,
    action: "company.delete",
    entityType: "Company",
    entityId: id,
    oldValue: existing.toObject(),
    newValue: null,
    ip,
  });
}

async function createCompanyAdmin(companyId, { name, email, password }, actorUserId, ip) {
  const company = await companyRepo.findById(companyId);
  if (!company) throw new ApiError(404, "COMPANY_NOT_FOUND", "No company exists with that ID.");

  const passwordHash = await hashPassword(password);
  const user = await userRepo.create({
    _id: generateId("USR"),
    companyId,
    email,
    passwordHash,
    name,
    role: ROLES.COMPANY_ADMIN,
    status: "active",
  });

  await auditLogRepo.record({
    actorUserId,
    action: "user.create",
    entityType: "User",
    entityId: user._id,
    oldValue: null,
    // Never store the password or its hash in an audit log.
    newValue: { name: user.name, email: user.email, role: user.role, companyId: user.companyId },
    ip,
  });

  return { id: user._id, name: user.name, email: user.email, role: user.role, companyId: user.companyId };
}

module.exports = {
  createCompany,
  listCompanies,
  getCompanyById,
  updateCompany,
  changeCompanyStatus,
  deleteCompany,
  createCompanyAdmin,
};
