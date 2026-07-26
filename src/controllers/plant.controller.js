const asyncHandler = require("../utils/asyncHandler");
const plantService = require("../services/plant.service");

const create = asyncHandler(async (req, res) => {
  const plant = await plantService.createPlant(req.body, req.user, req.ip);
  res.status(201).json({ success: true, data: plant, error: null });
});

const list = asyncHandler(async (req, res) => {
  const plants = await plantService.listPlants(req.companyScope);
  res.status(200).json({ success: true, data: plants, error: null });
});

const getById = asyncHandler(async (req, res) => {
  const plant = await plantService.getPlantById(req.params.id, req.companyScope);
  res.status(200).json({ success: true, data: plant, error: null });
});

const update = asyncHandler(async (req, res) => {
  const plant = await plantService.updatePlant(req.params.id, req.body, req.user, req.companyScope, req.ip);
  res.status(200).json({ success: true, data: plant, error: null });
});

const remove = asyncHandler(async (req, res) => {
  await plantService.deletePlant(req.params.id, req.user, req.ip);
  res.status(200).json({ success: true, data: { deleted: true }, error: null });
});

module.exports = { create, list, getById, update, remove };
