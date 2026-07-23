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

module.exports = { findByEmail, findById, create, updateLastLogin, countByRole };
