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

// --- QR Generation ---

const getQrUrl = asyncHandler(async (req, res) => {
  const url = await productService.getPublicUrl(req.params.id, req.companyScope);
  res.status(200).json({ success: true, data: { url }, error: null });
});

const getQrImage = asyncHandler(async (req, res) => {
  if (req.query.format === "dataurl") {
    const result = await productService.getQrDataUrl(req.params.id, req.companyScope);
    return res.status(200).json({ success: true, data: result, error: null });
  }
  // Default: raw PNG image, downloadable directly.
  const buffer = await productService.getQrPngBuffer(req.params.id, req.companyScope);
  res.set("Content-Type", "image/png");
  res.set("Content-Disposition", `attachment; filename="${req.params.id}-qr.png"`);
  res.status(200).send(buffer);
});

module.exports = { create, list, getById, update, remove, getQrUrl, getQrImage };
