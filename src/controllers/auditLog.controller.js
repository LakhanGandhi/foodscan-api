const asyncHandler = require("../utils/asyncHandler");
const auditLogService = require("../services/auditLog.service");

const list = asyncHandler(async (req, res) => {
  const logs = await auditLogService.listAuditLogs({
    entityType: req.query.entityType,
    entityId: req.query.entityId,
  });
  res.status(200).json({ success: true, data: logs, error: null });
});

module.exports = { list };
