const Company = require("../models/Company");

function create(data) {
  return Company.create(data);
}

function findById(id) {
  return Company.findById(id);
}

function findAll() {
  return Company.find({}).sort({ createdAt: -1 });
}

function updateById(id, updates) {
  return Company.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

function deleteById(id) {
  return Company.findByIdAndDelete(id);
}

module.exports = { create, findById, findAll, updateById, deleteById };
