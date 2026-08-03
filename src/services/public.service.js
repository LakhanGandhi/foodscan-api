const ApiError = require("../utils/ApiError");
const { lookupGeo } = require("../utils/geoLookup");
const hashVisitor = require("../utils/visitorHash");
const { computeExpiryStatus } = require("./batch.service");

const batchRepo = require("../repositories/batch.repository");
const productRepo = require("../repositories/product.repository");
const plantRepo = require("../repositories/plant.repository");
const companyRepo = require("../repositories/company.repository");
const brandRepo = require("../repositories/brand.repository");
const scanLogRepo = require("../repositories/scanLog.repository");

async function logScanAsync(batch, ip, userAgent, referrer) {
  try {
    const geo = await lookupGeo(ip);
    await scanLogRepo.record({
      productId: batch.productId,
      companyId: batch.companyId,
      plantId: batch.plantId,
      visitorHash: hashVisitor(ip, userAgent),
      country: geo.country,
      region: geo.region,
      city: geo.city,
      userAgent: userAgent || "",
      referrer: referrer || "",
    });
  } catch (err) {
    console.error("[scan log] failed:", err.message);
  }
}

async function getPublicBatchView(batchId, requestMeta) {
  const batch = await batchRepo.findById(batchId);
  if (!batch) {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product found for this code.");
  }

  const product = await productRepo.findById(batch.productId);
  if (!product || product.status === "hidden") {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product found for this code.");
  }

  const company = await companyRepo.findById(product.companyId);
  if (!company || company.status !== "approved") {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product found for this code.");
  }

  const plant = await plantRepo.findById(batch.plantId);
  if (!plant) {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product found for this code.");
  }

  const brand = await brandRepo.findById(product.brandId);
  if (!brand) {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product found for this code.");
  }

  if (requestMeta) {
    logScanAsync(batch, requestMeta.ip, requestMeta.userAgent, requestMeta.referrer);
  }

  const expiryStatus = computeExpiryStatus(batch.expDate);

  return {
    id: batch._id,
    name: product.productName,
    sku: product.sku,
    brand: brand.brandName,
    category: product.category,
    description: product.description,
    countryOfOrigin: product.countryOfOrigin,
    storageCondition: product.storageCondition,
    images: product.images,
    ingredients: product.ingredients,
    nutritionPer100g: product.nutritionPer100g,
    allergens: product.allergens,
    certifications: product.certifications,

    batch: {
      batchNumber: batch.batchNumber,
      mfgDate: batch.mfgDate,
      expDate: batch.expDate,
      expiryStatus, // { key: 'safe'|'near_expiry'|'expired', label, daysLeft }
      recalled: batch.status === "recalled",
    },

    plant: {
      name: plant.plantName,
      address: plant.address,
      city: plant.city,
      state: plant.state,
      country: plant.country,
      pinCode: plant.pinCode,
      fssaiLicense: plant.fssaiLicense,
    },
    company: {
      name: company.companyName,
      address: company.address,
      website: company.website,
      email: company.email,
      phoneNumber: company.phoneNumber,
    },
  };
}

module.exports = { getPublicBatchView };
