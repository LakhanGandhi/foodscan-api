const AuditLog = require("../models/AuditLog");

function record({ actorUserId, action, entityType, entityId, oldValue = null, newValue = null, ip = null }) {
  return AuditLog.create({ actorUserId, action, entityType, entityId, oldValue, newValue, ip });
}

function findByEntity(entityType, entityId) {
  return AuditLog.find({ entityType, entityId }).sort({ timestamp: -1 });
}

function findAll({ entityType, entityId } = {}) {
  const filter = {};
  if (entityType) filter.entityType = entityType;
  if (entityId) filter.entityId = entityId;
  return AuditLog.find(filter).sort({ timestamp: -1 }).limit(200);
}

module.exports = { record, findByEntity, findAll };
