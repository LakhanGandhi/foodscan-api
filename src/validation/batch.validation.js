function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidDate(v) {
  return v && !isNaN(new Date(v).getTime());
}

function createBatchValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.productId)) errors.push("productId is required.");
  if (!isNonEmptyString(body.plantId)) errors.push("plantId is required.");
  if (!isNonEmptyString(body.batchNumber)) errors.push("batchNumber is required.");
  if (!isValidDate(body.mfgDate)) errors.push("mfgDate must be a valid date.");
  if (!isValidDate(body.expDate)) errors.push("expDate must be a valid date.");
  if (isValidDate(body.mfgDate) && isValidDate(body.expDate) && new Date(body.expDate) <= new Date(body.mfgDate)) {
    errors.push("expDate must be after mfgDate.");
  }
  return errors;
}

function updateBatchValidator(body) {
  const errors = [];
  if (body.mfgDate !== undefined && !isValidDate(body.mfgDate)) errors.push("mfgDate must be a valid date.");
  if (body.expDate !== undefined && !isValidDate(body.expDate)) errors.push("expDate must be a valid date.");
  if (body.status && !["active", "recalled"].includes(body.status)) {
    errors.push("status must be 'active' or 'recalled'.");
  }
  return errors;
}

module.exports = { createBatchValidator, updateBatchValidator };
