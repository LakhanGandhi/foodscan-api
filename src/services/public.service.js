const ApiError = require("../utils/ApiError");
const { lookupGeo } = require("../utils/geoLookup");
const hashVisitor = require("../utils/visitorHash");

const productRepo = require("../repositories/product.repository");
const plantRepo = require("../repositories/plant.repository");
const companyRepo = require("../repositories/company.repository");
const brandRepo = require("../repositories/brand.repository");
const scanLogRepo = require("../repositories/scanLog.repository");

async function logScanAsync(product, ip, userAgent, referrer) {
  try {
    const geo = await lookupGeo(ip);
    await scanLogRepo.record({
      productId: product._id,
      companyId: product.companyId,
      plantId: product.plantId,
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

async function getPublicProductView(productId, requestMeta) {
  const product = await productRepo.findById(productId);
  if (!product || product.status === "hidden") {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product found for this code.");
  }

  const company = await companyRepo.findById(product.companyId);
  if (!company || company.status !== "approved") {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product found for this code.");
  }

  const plant = await plantRepo.findById(product.plantId);
  if (!plant) {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product found for this code.");
  }

  const brand = await brandRepo.findById(product.brandId);
  if (!brand) {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product found for this code.");
  }

  if (requestMeta) {
    logScanAsync(product, requestMeta.ip, requestMeta.userAgent, requestMeta.referrer);
  }

  return {
    id: product._id,
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
    status: product.status,
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
      brandName: company.brandName,
      address: company.address,
      website: company.website,
      email: company.email,
      phoneNumber: company.phoneNumber,
    },
  };
}

module.exports = { getPublicProductView };
