const asyncHandler = require("../utils/asyncHandler");
const productService = require("../services/product.service");

const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user, req.ip);
  res.status(201).json({ success: true, data: product, error: null });
});

const list = asyncHandler(async (req, res) => {
  const products = await productService.listProducts(req.companyScope);
  res.status(200).json({ success: true, data: products, error: null });
});

const getById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id, req.companyScope);
  res.status(200).json({ success: true, data: product, error: null });
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.user, req.companyScope, req.ip);
  res.status(200).json({ success: true, data: product, error: null });
});

const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user, req.ip);
  res.status(200).json({ success: true, data: { deleted: true }, error: null });
});

module.exports = { create, list, getById, update, remove };
