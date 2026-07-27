const User = require("../models/User");

function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase().trim() });
}

function findById(id) {
  return User.findById(id);
}

function create(data) {
  return User.create(data);
}

function updateLastLogin(id) {
  return User.findByIdAndUpdate(id, { lastLoginAt: new Date() });
}

function countByRole(role) {
  return User.countDocuments({ role });
}

// --- new for Employee Management ---

function findAll(companyScope) {
  // companyScope is null for Super Admin (no restriction), or a companyId for everyone else.
  const filter = companyScope ? { companyId: companyScope } : {};
  return User.find(filter).sort({ createdAt: -1 });
}

function updateById(id, updates) {
  return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

module.exports = {
  findByEmail,
  findById,
  create,
  updateLastLogin,
  countByRole,
  findAll,
  updateById,
};
