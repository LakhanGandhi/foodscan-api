const CompanyChangeRequest = require("../models/CompanyChangeRequest");

function create(data) {
  return CompanyChangeRequest.create(data);
}

function findById(id) {
  return CompanyChangeRequest.findById(id);
}

function findPendingByCompanyId(companyId) {
  return CompanyChangeRequest.findOne({ companyId, status: "pending" });
}

function findAllPending() {
  return CompanyChangeRequest.find({ status: "pending" }).sort({ createdAt: -1 });
}

function updateById(id, updates) {
  return CompanyChangeRequest.findByIdAndUpdate(id, updates, { new: true });
}

module.exports = {
  create,
  findById,
  findPendingByCompanyId,
  findAllPending,
  updateById,
};
