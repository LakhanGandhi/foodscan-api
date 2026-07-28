const mongoose = require("mongoose");

const scanLogSchema = new mongoose.Schema(
  {
    productId: { type: String, ref: "Product", required: true, index: true },
    companyId: { type: String, ref: "Company", required: true, index: true },
    plantId: { type: String, ref: "Plant", required: true },

    visitorHash: { type: String, required: true }, // hash of IP + User-Agent, not raw

    country: { type: String, default: "Unknown" },
    region: { type: String, default: "Unknown" },
    city: { type: String, default: "Unknown" },

    userAgent: { type: String, default: "" },
    referrer: { type: String, default: "" },
  },
  { timestamps: { createdAt: "scannedAt", updatedAt: false } }
);

scanLogSchema.index({ scannedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });
scanLogSchema.index({ companyId: 1, scannedAt: -1 });

module.exports = mongoose.model("ScanLog", scanLogSchema);
