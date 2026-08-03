const asyncHandler = require("../utils/asyncHandler");
const batchService = require("../services/batch.service");

const create = asyncHandler(async (req, res) => {
  const batch = await batchService.createBatch(req.body, req.user, req.ip);
  res.status(201).json({ success: true, data: batch, error: null });
});

const list = asyncHandler(async (req, res) => {
  const batches = await batchService.listBatches(req.companyScope);
  res.status(200).json({ success: true, data: batches, error: null });
});

const getById = asyncHandler(async (req, res) => {
  const batch = await batchService.getBatchById(req.params.id, req.companyScope);
  res.status(200).json({ success: true, data: batch, error: null });
});

const update = asyncHandler(async (req, res) => {
  const batch = await batchService.updateBatch(req.params.id, req.body, req.user, req.companyScope, req.ip);
  res.status(200).json({ success: true, data: batch, error: null });
});

const getQrUrl = asyncHandler(async (req, res) => {
  const url = await batchService.getPublicUrl(req.params.id, req.companyScope);
  res.status(200).json({ success: true, data: { url }, error: null });
});

const getQrImage = asyncHandler(async (req, res) => {
  if (req.query.format === "dataurl") {
    const result = await batchService.getQrDataUrl(req.params.id, req.companyScope);
    return res.status(200).json({ success: true, data: result, error: null });
  }
  const buffer = await batchService.getQrPngBuffer(req.params.id, req.companyScope);
  res.set("Content-Type", "image/png");
  res.set("Content-Disposition", `attachment; filename="${req.params.id}-qr.png"`);
  res.status(200).send(buffer);
});

module.exports = { create, list, getById, update, getQrUrl, getQrImage };
