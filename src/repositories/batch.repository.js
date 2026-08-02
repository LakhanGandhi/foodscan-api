const Batch = require("../models/Batch");

function create(data) {
  return Batch.create(data);
}

function findById(id) {
  return Batch.findById(id);
}

function findAll(companyScope) {
  const filter = companyScope ? { companyId: companyScope } : {};
  return Batch.find(filter).sort({ createdAt: -1 });
}

function findByProductId(productId) {
  return Batch.find({ productId }).sort({ createdAt: -1 });
}

function updateById(id, updates) {
  return Batch.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

module.exports = { create, findById, findAll, findByProductId, updateById };
