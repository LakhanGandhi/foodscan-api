const Plant = require("../models/Plant");

function create(data) {
  return Plant.create(data);
}

function findById(id) {
  return Plant.findById(id);
}

function findAll(companyScope) {
  // companyScope is null for Super Admin (no restriction), or a companyId for everyone else.
  const filter = companyScope ? { companyId: companyScope } : {};
  return Plant.find(filter).sort({ createdAt: -1 });
}

function updateById(id, updates) {
  return Plant.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

function deleteById(id) {
  return Plant.findByIdAndDelete(id);
}

module.exports = { create, findById, findAll, updateById, deleteById };
