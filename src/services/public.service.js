const ApiError = require("../utils/ApiError");

const productRepo = require("../repositories/product.repository");
const plantRepo = require("../repositories/plant.repository");
const companyRepo = require("../repositories/company.repository");

/**
 * Public-safe view of a product, for the QR landing page. No login,
 * so this is the most exposed endpoint in the whole system - it
 * deliberately returns a hand-picked subset of fields, never the raw
 * database documents. GST/PAN/CIN, internal contact details, audit
 * fields, timestamps, and raw companyId/plantId references are never
 * included here.
 */
async function getPublicProductView(productId) {
  const product = await productRepo.findById(productId);
  // A "hidden" product is not found to the public, full stop - not
  // "restricted," genuinely absent, so its existence isn't confirmed.
  if (!product || product.status === "hidden") {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product found for this code.");
  }

  const company = await companyRepo.findById(product.companyId);
  // A product belonging to a company that isn't approved (pending/
  // disabled/suspended) is also treated as not found publicly.
  if (!company || company.status !== "approved") {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product found for this code.");
  }

  const plant = await plantRepo.findById(product.plantId);
  if (!plant) {
    throw new ApiError(404, "PRODUCT_NOT_FOUND", "No product found for this code.");
  }

  return {
    id: product._id,
    name: product.productName,
    sku: product.sku,
    brand: product.brand,
    category: product.category,
    description: product.description,
    countryOfOrigin: product.countryOfOrigin,
    storageCondition: product.storageCondition,
    images: product.images,
    ingredients: product.ingredients,
    nutritionPer100g: product.nutritionPer100g,
    allergens: product.allergens,
    certifications: product.certifications,
    status: product.status, // e.g. lets the frontend show a "discontinued" notice

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
