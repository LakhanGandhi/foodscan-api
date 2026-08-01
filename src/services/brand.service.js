const ApiError = require("../utils/ApiError");
const ROLES = require("../utils/roles");

const brandRepo = require("../repositories/brand.repository");
const companyRepo = require("../repositories/company.repository");
const auditLogRepo = require("../repositories/auditLog.repository");

function assertAccess(brand, companyScope) {
  if (companyScope && brand.companyId !== companyScope) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this brand.");
  }
}

async function createBrand(data, actorUser, ip) {
  const companyId = actorUser.role === ROLES.SUPER_ADMIN ? data.companyId : actorUser.companyId;

  const company = await companyRepo.findById(companyId);
  if (!company) throw new ApiError(400, "INVALID_COMPANY", "No company exists with that companyId.");
  if (company.status !== "approved") {
    throw new ApiError(400, "COMPANY_NOT_APPROVED", "Brands can only be created for companies with 'approved' status.");
  }

  const brand = await brandRepo.create({ ...data, companyId, createdBy: actorUser.userId });

  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "brand.create",
    entityType: "Brand",
    entityId: brand._id,
    oldValue: null,
    newValue: brand.toObject(),
    ip,
  });
  return brand;
}

async function listBrands(companyScope) {
  const brands = await brandRepo.findAll(companyScope);
  const enriched = await Promise.all(
    brands.map(async (b) => {
      const company = await companyRepo.findById(b.companyId);
      const obj = b.toObject();
      obj.companyName = company ? company.companyName : "Unknown";
      return obj;
    })
  );
  return enriched;
}

async function getBrandById(id, companyScope) {
  const brand = await brandRepo.findById(id);
  if (!brand) throw new ApiError(404, "BRAND_NOT_FOUND", "No brand exists with that ID.");
  assertAccess(brand, companyScope);
  return brand;
}

async function updateBrand(id, updates, actorUser, companyScope, ip) {
  const existing = await brandRepo.findById(id);
  if (!existing) throw new ApiError(404, "BRAND_NOT_FOUND", "No brand exists with that ID.");
  assertAccess(existing, companyScope);

  const { companyId, ...safeUpdates } = updates;
  const oldValue = existing.toObject();
  const updated = await brandRepo.updateById(id, safeUpdates);

  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "brand.update",
    entityType: "Brand",
    entityId: id,
    oldValue,
    newValue: updated.toObject(),
    ip,
  });
  return updated;
}

module.exports = { createBrand, listBrands, getBrandById, updateBrand };
