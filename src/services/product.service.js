const ApiError = require("../utils/ApiError");
const ROLES = require("../utils/roles");

const productRepo = require("../repositories/product.repository");
const companyRepo = require("../repositories/company.repository");
const plantRepo = require("../repositories/plant.repository");
const auditLogRepo = require("../repositories/auditLog.repository");

function assertAccess(product, companyScope) {
  if (companyScope && product.companyId !== companyScope) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this product.");
  }
}

async function assertPlantBelongsToCompany(plantId, companyId) {
  const plant = await plantRepo.findById(plantId);
  if (!plant) throw new ApiError(400, "INVALID_PLANT", "No plant exists with that plantId.");
  if (plant.companyId !== companyId) {
    throw new ApiError(400, "PLANT_COMPANY_MISMATCH", "That plant does not belong to this company.");
  }
  return plant;
}

async function createProduct(data, actorUser, ip) {
  // Company Admin/Employee can only create a product under their own company, regardless of what companyId was sent.
  const companyId = actorUser.role === ROLES.SUPER_ADMIN ? data.companyId : actorUser.companyId;

  const company = await companyRepo.findById(companyId);
  if (!company) throw new ApiError(400, "INVALID_COMPANY", "No company exists with that companyId.");

  await assertPlantBelongsToCompany(data.plantId, companyId);

  const product = await productRepo.create({ ...data, companyId, createdBy: actorUser.userId });

  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "product.create",
    entityType: "Product",
    entityId: product._id,
    oldValue: null,
    newValue: product.toObject(),
    ip,
  });
  return product;
}

async function listProducts(companyScope) {
  return productRepo.findAll(companyScope);
}

async function getProductById(id, companyScope) {
  const product = await productRepo.findById(id);
  if (!product) throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product exists with that ID.");
  assertAccess(product, companyScope);
  return product;
}

async function updateProduct(id, updates, actorUser, companyScope, ip) {
  const existing = await productRepo.findById(id);
  if (!existing) throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product exists with that ID.");
  assertAccess(existing, companyScope);

  // A product's owning company is structural - never editable. Its plant CAN
  // be reassigned (e.g. production relocated), but only to another plant
  // within the SAME company.
  const { companyId, plantId, ...safeUpdates } = updates;
  if (plantId) {
    await assertPlantBelongsToCompany(plantId, existing.companyId);
    safeUpdates.plantId = plantId;
  }

  const oldValue = existing.toObject();
  const updated = await productRepo.updateById(id, safeUpdates);

  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "product.update",
    entityType: "Product",
    entityId: id,
    oldValue,
    newValue: updated.toObject(),
    ip,
  });
  return updated;
}

async function deleteProduct(id, actorUser, ip) {
  const existing = await productRepo.findById(id);
  if (!existing) throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product exists with that ID.");

  await productRepo.deleteById(id);
  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "product.delete",
    entityType: "Product",
    entityId: id,
    oldValue: existing.toObject(),
    newValue: null,
    ip,
  });
}

module.exports = { createProduct, listProducts, getProductById, updateProduct, deleteProduct };
