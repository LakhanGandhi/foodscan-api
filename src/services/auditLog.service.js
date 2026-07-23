const auditLogRepo = require("../repositories/auditLog.repository");

function listAuditLogs({ entityType, entityId }) {
  return auditLogRepo.findAll({ entityType, entityId });
}

module.exports = { listAuditLogs };
