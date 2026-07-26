const Product = require("../models/Product");

function create(data) {
  return Product.create(data);
}

function findById(id) {
  return Product.findById(id);
}

function findAll(companyScope) {
  const filter = companyScope ? { companyId: companyScope } : {};
  return Product.find(filter).sort({ createdAt: -1 });
}

function updateById(id, updates) {
  return Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

function deleteById(id) {
  return Product.findByIdAndDelete(id);
}

module.exports = { create, findById, findAll, updateById, deleteById };
