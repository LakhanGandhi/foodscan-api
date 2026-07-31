const Brand = require("../models/Brand");

function create(data) {
  return Brand.create(data);
}

function findById(id) {
  return Brand.findById(id);
}

function findAll(companyScope) {
  const filter = companyScope ? { companyId: companyScope } : {};
  return Brand.find(filter).sort({ createdAt: -1 });
}

function updateById(id, updates) {
  return Brand.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

module.exports = { create, findById, findAll, updateById };
