const mongoose = require("mongoose");
const generateId = require("../utils/idGenerator");

// Fields a Company Admin is allowed to propose changes to.
// Kept here so the schema/service/validation all reference one source of truth.
const EDITABLE_FIELDS = ["companyName", "legalCompanyName", "companyType", "website", "email", "phoneNumber"];

const companyChangeRequestSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => generateId("CCR") },

    companyId: { type: String, ref: "Company", required: true },
    requestedBy: { type: String, ref: "User", required: true },

    // Only the fields being changed, e.g. { companyName: "New Name", email: "new@x.com" }
    proposedChanges: {
      type: Object,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewedBy: { type: String, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

companyChangeRequestSchema.statics.EDITABLE_FIELDS = EDITABLE_FIELDS;

module.exports = mongoose.model("CompanyChangeRequest", companyChangeRequestSchema);
