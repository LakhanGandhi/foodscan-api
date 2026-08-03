const ApiError = require("../utils/ApiError");
const ROLES = require("../utils/roles");
const { buildPublicBatchUrl, generateQrPngBuffer, generateQrDataUrl } = require("../utils/qrCode");

const batchRepo = require("../repositories/batch.repository");
const productRepo = require("../repositories/product.repository");
const plantRepo = require("../repositories/plant.repository");
const companyRepo = require("../repositories/company.repository");
const auditLogRepo = require("../repositories/auditLog.repository");

const NEAR_EXPIRY_WINDOW_DAYS = 15;

function assertAccess(batch, companyScope) {
  if (companyScope && batch.companyId !== companyScope) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this batch.");
  }
}

async function assertProductBelongsToCompany(productId, companyId) {
  const product = await productRepo.findById(productId);
  if (!product) throw new ApiError(400, "INVALID_PRODUCT", "No product exists with that productId.");
  if (product.companyId !== companyId) {
    throw new ApiError(400, "PRODUCT_COMPANY_MISMATCH", "That product does not belong to this company.");
  }
  return product;
}

async function assertPlantBelongsToCompany(plantId, companyId) {
  const plant = await plantRepo.findById(plantId);
  if (!plant) throw new ApiError(400, "INVALID_PLANT", "No plant exists with that plantId.");
  if (plant.companyId !== companyId) {
    throw new ApiError(400, "PLANT_COMPANY_MISMATCH", "That plant does not belong to this company.");
  }
  return plant;
}

/**
 * Same Safe / Near Expiry / Expired logic as the original prototype,
 * now computed from real batch data instead of a placeholder field.
 */
function computeExpiryStatus(expDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expDate);
  const daysLeft = Math.round((exp - today) / 86400000);

  if (daysLeft < 0) return { key: "expired", label: "Expired", daysLeft };
  if (daysLeft <= NEAR_EXPIRY_WINDOW_DAYS) return { key: "near_expiry", label: "Near Expiry", daysLeft };
  return { key: "safe", label: "Safe", daysLeft };
}

async function createBatch(data, actorUser, ip) {
  const companyId = actorUser.role === ROLES.SUPER_ADMIN ? data.companyId : actorUser.companyId;

  const company = await companyRepo.findById(companyId);
  if (!company) throw new ApiError(400, "INVALID_COMPANY", "No company exists with that companyId.");

  await assertProductBelongsToCompany(data.productId, companyId);
  await assertPlantBelongsToCompany(data.plantId, companyId);

  const batch = await batchRepo.create({ ...data, companyId, createdBy: actorUser.userId });

  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "batch.create",
    entityType: "Batch",
    entityId: batch._id,
    oldValue: null,
    newValue: batch.toObject(),
    ip,
  });
  return batch;
}

async function listBatches(companyScope) {
  return batchRepo.findAll(companyScope);
}

async function getBatchById(id, companyScope) {
  const batch = await batchRepo.findById(id);
  if (!batch) throw new ApiError(404, "BATCH_NOT_FOUND", "No batch exists with that ID.");
  assertAccess(batch, companyScope);
  return batch;
}

async function updateBatch(id, updates, actorUser, companyScope, ip) {
  const existing = await batchRepo.findById(id);
  if (!existing) throw new ApiError(404, "BATCH_NOT_FOUND", "No batch exists with that ID.");
  assertAccess(existing, companyScope);

  // productId/plantId/companyId are structural - never editable after creation.
  const { productId, plantId, companyId, ...safeUpdates } = updates;

  const oldValue = existing.toObject();
  const updated = await batchRepo.updateById(id, safeUpdates);

  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "batch.update",
    entityType: "Batch",
    entityId: id,
    oldValue,
    newValue: updated.toObject(),
    ip,
  });
  return updated;
}

// --- QR Generation ---

async function getPublicUrl(id, companyScope) {
  await getBatchById(id, companyScope);
  return buildPublicBatchUrl(id);
}

async function getQrPngBuffer(id, companyScope) {
  const url = await getPublicUrl(id, companyScope);
  return generateQrPngBuffer(url);
}

async function getQrDataUrl(id, companyScope) {
  const url = await getPublicUrl(id, companyScope);
  const dataUrl = await generateQrDataUrl(url);
  return { url, dataUrl };
}

module.exports = {
  createBatch,
  listBatches,
  getBatchById,
  updateBatch,
  computeExpiryStatus,
  getPublicUrl,
  getQrPngBuffer,
  getQrDataUrl,
};
