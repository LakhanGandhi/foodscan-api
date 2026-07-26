function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function createPlantValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.companyId)) errors.push("companyId is required.");

  const required = {
    plantName: body.plantName,
    plantCode: body.plantCode,
    address: body.address,
    city: body.city,
    state: body.state,
    country: body.country,
    pinCode: body.pinCode,
    contactPerson: body.contactPerson,
    contactNumber: body.contactNumber,
    email: body.email,
    fssaiLicense: body.fssaiLicense,
  };
  Object.entries(required).forEach(([field, value]) => {
    if (!isNonEmptyString(value)) errors.push(`${field} is required.`);
  });

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push("email must be a valid email address.");
  }
  if (body.latitude !== undefined && body.latitude !== null && typeof body.latitude !== "number") {
    errors.push("latitude must be a number.");
  }
  if (body.longitude !== undefined && body.longitude !== null && typeof body.longitude !== "number") {
    errors.push("longitude must be a number.");
  }

  return errors;
}

function updatePlantValidator(body) {
  // Partial update - only validate fields that were actually sent.
  const errors = [];
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push("email must be a valid email address.");
  }
  if (body.status && !["active", "inactive"].includes(body.status)) {
    errors.push("status must be 'active' or 'inactive'.");
  }
  return errors;
}

module.exports = { createPlantValidator, updatePlantValidator };
