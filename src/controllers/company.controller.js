const asyncHandler = require("../utils/asyncHandler");
const companyService = require("../services/company.service");

const create = asyncHandler(async (req, res) => {
  const company = await companyService.createCompany(req.body, req.user.userId, req.ip);
  res.status(201).json({ success: true, data: company, error: null });
});

const list = asyncHandler(async (req, res) => {
  const companies = await companyService.listCompanies();
  res.status(200).json({ success: true, data: companies, error: null });
});

const getById = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id, req.companyScope);
  res.status(200).json({ success: true, data: company, error: null });
});

const update = asyncHandler(async (req, res) => {
  const company = await companyService.updateCompany(
    req.params.id,
    req.body,
    req.user.userId,
    req.companyScope,
    req.ip
  );
  res.status(200).json({ success: true, data: company, error: null });
});

const changeStatus = asyncHandler(async (req, res) => {
  const company = await companyService.changeCompanyStatus(req.params.id, req.body.status, req.user.userId, req.ip);
  res.status(200).json({ success: true, data: company, error: null });
});

const remove = asyncHandler(async (req, res) => {
  await companyService.deleteCompany(req.params.id, req.user.userId, req.ip);
  res.status(200).json({ success: true, data: { deleted: true }, error: null });
});

const createAdmin = asyncHandler(async (req, res) => {
  const admin = await companyService.createCompanyAdmin(req.params.id, req.body, req.user.userId, req.ip);
  res.status(201).json({ success: true, data: admin, error: null });
});

module.exports = { create, list, getById, update, changeStatus, remove, createAdmin };
