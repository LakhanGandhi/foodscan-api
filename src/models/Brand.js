const mongoose = require("mongoose");
const generateId = require("../utils/idGenerator");

const brandSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => generateId("BRD") },
    companyId: { type: String, ref: "Company", required: true, index: true },
    brandName: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdBy: { type: String, ref: "User", required: true },
  },
  { timestamps: true }
);

brandSchema.index({ companyId: 1, brandName: 1 }, { unique: true });

module.exports = mongoose.model("Brand", brandSchema);
