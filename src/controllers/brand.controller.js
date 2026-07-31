const asyncHandler = require("../utils/asyncHandler");
const brandService = require("../services/brand.service");

const create = asyncHandler(async (req, res) => {
  const brand = await brandService.createBrand(req.body, req.user, req.ip);
  res.status(201).json({ success: true, data: brand, error: null });
});

const list = asyncHandler(async (req, res) => {
  const brands = await brandService.listBrands(req.companyScope);
  res.status(200).json({ success: true, data: brands, error: null });
});

const getById = asyncHandler(async (req, res) => {
  const brand = await brandService.getBrandById(req.params.id, req.companyScope);
  res.status(200).json({ success: true, data: brand, error: null });
});

const update = asyncHandler(async (req, res) => {
  const brand = await brandService.updateBrand(req.params.id, req.body, req.user, req.companyScope, req.ip);
  res.status(200).json({ success: true, data: brand, error: null });
});

module.exports = { create, list, getById, update };
