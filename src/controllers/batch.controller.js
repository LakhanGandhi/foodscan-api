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

module.exports = { create, list, getById, update };
