function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function createProductValidator(body) {
  const errors = [];

  const required = {
    companyId: body.companyId,
    brandId: body.brandId,
    productName: body.productName,
    sku: body.sku,
    category: body.category,
    countryOfOrigin: body.countryOfOrigin,
  };
  Object.entries(required).forEach(([field, value]) => {
    if (!isNonEmptyString(value)) errors.push(`${field} is required.`);
  });

  if (body.ingredients !== undefined && !Array.isArray(body.ingredients)) {
    errors.push("ingredients must be an array.");
  }
  if (body.allergens !== undefined && !Array.isArray(body.allergens)) {
    errors.push("allergens must be an array.");
  }
  if (body.certifications !== undefined && !Array.isArray(body.certifications)) {
    errors.push("certifications must be an array.");
  }

  return errors;
}

function updateProductValidator(body) {
  const errors = [];
  if (body.status && !["active", "hidden", "discontinued"].includes(body.status)) {
    errors.push("status must be 'active', 'hidden', or 'discontinued'.");
  }
  if (body.ingredients !== undefined && !Array.isArray(body.ingredients)) {
    errors.push("ingredients must be an array.");
  }
  if (body.allergens !== undefined && !Array.isArray(body.allergens)) {
    errors.push("allergens must be an array.");
  }
  if (body.certifications !== undefined && !Array.isArray(body.certifications)) {
    errors.push("certifications must be an array.");
  }
  return errors;
}

module.exports = { createProductValidator, updateProductValidator };
