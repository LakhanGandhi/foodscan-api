function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function createCompanyValidator(body) {
  const errors = [];
  const required = {
    companyName: body.companyName,
    legalCompanyName: body.legalCompanyName,
    companyType: body.companyType,
    gstNumber: body.gstNumber,
    website: body.website,
    email: body.email,
    phoneNumber: body.phoneNumber,
  };
  Object.entries(required).forEach(([field, value]) => {
    if (!isNonEmptyString(value)) errors.push(`${field} is required.`);
  });

  const address = body.address || {};
  const requiredAddress = {
    line1: address.line1,
    city: address.city,
    state: address.state,
    country: address.country,
    pinCode: address.pinCode,
  };
  Object.entries(requiredAddress).forEach(([field, value]) => {
    if (!isNonEmptyString(value)) errors.push(`address.${field} is required.`);
  });

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push("email must be a valid email address.");
  }

  return errors;
}

function updateCompanyValidator(body) {
  // Update is partial - only validate fields that were actually sent.
  const errors = [];
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push("email must be a valid email address.");
  }
  return errors;
}

function changeStatusValidator(body) {
  const errors = [];
  const allowed = ["pending", "approved", "disabled", "suspended"];
  if (!allowed.includes(body.status)) {
    errors.push(`status must be one of: ${allowed.join(", ")}`);
  }
  return errors;
}

function createCompanyAdminValidator(body) {
  const errors = [];
  if (!isNonEmptyString(body.name)) errors.push("name is required.");
  if (!isNonEmptyString(body.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push("A valid email is required.");
  }
  if (!body.password || body.password.length < 8) {
    errors.push("password must be at least 8 characters.");
  }
  return errors;
}

module.exports = {
  createCompanyValidator,
  updateCompanyValidator,
  changeStatusValidator,
  createCompanyAdminValidator,
};
