const mongoose = require("mongoose");
const generateId = require("../utils/idGenerator");

/**
 * A Batch is one production run of a Product. This is deliberately
 * separate from Product itself: a product ("Maggi 2-Minute Noodles")
 * is manufactured repeatedly over time, each run with its own batch
 * number, manufacturing/expiry dates, and potentially a different
 * plant. The QR code on a package points to a BATCH, not a product -
 * that's what lets the public page show accurate expiry info, and
 * what will let a future Recall feature target one specific batch
 * without touching the product catalog entry at all.
 */
const batchSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => generateId("BAT") },
    productId: { type: String, ref: "Product", required: true, index: true },
    plantId: { type: String, ref: "Plant", required: true, index: true },
    companyId: { type: String, ref: "Company", required: true, index: true }, // denormalized for fast scoped queries

    batchNumber: { type: String, required: true, trim: true },
    mfgDate: { type: Date, required: true },
    expDate: { type: Date, required: true },

    status: { type: String, enum: ["active", "recalled"], default: "active" },
    createdBy: { type: String, ref: "User", required: true },
  },
  { timestamps: true }
);

batchSchema.index({ productId: 1, batchNumber: 1 }, { unique: true });

module.exports = mongoose.model("Batch", batchSchema);
