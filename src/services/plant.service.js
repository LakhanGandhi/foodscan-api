const ApiError = require("../utils/ApiError");
const ROLES = require("../utils/roles");

const plantRepo = require("../repositories/plant.repository");
const companyRepo = require("../repositories/company.repository");
const auditLogRepo = require("../repositories/auditLog.repository");

function assertAccess(plant, companyScope) {
  if (companyScope && plant.companyId !== companyScope) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this plant.");
  }
}

async function createPlant(data, actorUser, ip) {
  // Company Admin can only create a plant under their own company, regardless of what companyId was sent.
  const companyId = actorUser.role === ROLES.SUPER_ADMIN ? data.companyId : actorUser.companyId;

  const company = await companyRepo.findById(companyId);
  if (!company) throw new ApiError(400, "INVALID_COMPANY", "No company exists with that companyId.");

  const plant = await plantRepo.create({ ...data, companyId, createdBy: actorUser.userId });

  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "plant.create",
    entityType: "Plant",
    entityId: plant._id,
    oldValue: null,
    newValue: plant.toObject(),
    ip,
  });
  return plant;
}

async function listPlants(companyScope) {
  const plants = await plantRepo.findAll(companyScope);
  const enriched = await Promise.all(
    plants.map(async (p) => {
      const company = await companyRepo.findById(p.companyId);
      const obj = p.toObject();
      obj.companyName = company ? company.companyName : "Unknown";
      return obj;
    })
  );
  return enriched;
}

async function getPlantById(id, companyScope) {
  const plant = await plantRepo.findById(id);
  if (!plant) throw new ApiError(404, "PLANT_NOT_FOUND", "No plant exists with that ID.");
  assertAccess(plant, companyScope);
  return plant;
}

async function updatePlant(id, updates, actorUser, companyScope, ip) {
  const existing = await plantRepo.findById(id);
  if (!existing) throw new ApiError(404, "PLANT_NOT_FOUND", "No plant exists with that ID.");
  assertAccess(existing, companyScope);

  // A plant's owning company is structural, not an editable field - never let it change via update.
  const { companyId, ...safeUpdates } = updates;

  const oldValue = existing.toObject();
  const updated = await plantRepo.updateById(id, safeUpdates);

  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "plant.update",
    entityType: "Plant",
    entityId: id,
    oldValue,
    newValue: updated.toObject(),
    ip,
  });
  return updated;
}

async function deletePlant(id, actorUser, ip) {
  const existing = await plantRepo.findById(id);
  if (!existing) throw new ApiError(404, "PLANT_NOT_FOUND", "No plant exists with that ID.");

  await plantRepo.deleteById(id);
  await auditLogRepo.record({
    actorUserId: actorUser.userId,
    action: "plant.delete",
    entityType: "Plant",
    entityId: id,
    oldValue: existing.toObject(),
    newValue: null,
    ip,
  });
}

module.exports = { createPlant, listPlants, getPlantById, updatePlant, deletePlant };
