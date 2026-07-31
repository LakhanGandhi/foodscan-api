const ApiError = require("../utils/ApiError");
const ROLES = require("../utils/roles");
const { buildPublicProductUrl, generateQrPngBuffer, generateQrDataUrl } = require("../utils/qrCode");

const productRepo = require("../repositories/product.repository");
const companyRepo = require("../repositories/company.repository");
const plantRepo = require("../repositories/plant.repository");
const brandRepo = require("../repositories/brand.repository");
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

async function assertBrandBelongsToCompany(brandId, companyId) {
  const brand = await brandRepo.findById(brandId);
  if (!brand) throw new ApiError(400, "INVALID_BRAND", "No brand exists with that brandId.");
  if (brand.companyId !== companyId) {
    throw new ApiError(400, "BRAND_COMPANY_MISMATCH", "That brand does not belong to this company.");
  }
  return brand;
}

async function createProduct(data, actorUser, ip) {
  const companyId = actorUser.role === ROLES.SUPER_ADMIN ? data.companyId : actorUser.companyId;

  const company = await companyRepo.findById(companyId);
  if (!company) throw new ApiError(400, "INVALID_COMPANY", "No company exists with that companyId.");

  await assertPlantBelongsToCompany(data.plantId, companyId);
  await assertBrandBelongsToCompany(data.brandId, companyId);

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

  const { companyId, plantId, brandId, ...safeUpdates } = updates;
  if (plantId) {
    await assertPlantBelongsToCompany(plantId, existing.companyId);
    safeUpdates.plantId = plantId;
  }
  if (brandId) {
    await assertBrandBelongsToCompany(brandId, existing.companyId);
    safeUpdates.brandId = brandId;
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

async function getPublicUrl(id, companyScope) {
  await getProductById(id, companyScope);
  return buildPublicProductUrl(id);
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
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPublicUrl,
  getQrPngBuffer,
  getQrDataUrl,
};
