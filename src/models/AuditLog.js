const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actorUserId: { type: String, ref: "User", required: true },
    action: { type: String, required: true }, // e.g. "company.create", "company.status_change"
    entityType: { type: String, required: true }, // e.g. "Company"
    entityId: { type: String, required: true, index: true },
    oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
    newValue: { type: mongoose.Schema.Types.Mixed, default: null },
    ip: { type: String, default: null },
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } }
);

auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
