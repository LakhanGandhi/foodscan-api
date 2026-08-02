const mongoose = require("mongoose");
const generateId = require("../utils/idGenerator");

const productSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => generateId("PRD") },
    companyId: { type: String, ref: "Company", required: true, index: true },
    brandId: { type: String, ref: "Brand", required: true, index: true },

    // Basic
    productName: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, uppercase: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },

    countryOfOrigin: { type: String, required: true, trim: true },
    storageCondition: { type: String, trim: true, default: "" },

    images: {
      front: { type: String, default: null },
      back: { type: String, default: null },
      ingredients: { type: String, default: null },
      nutrition: { type: String, default: null },
      barcode: { type: String, default: null },
    },

    ingredients: { type: [String], default: [] },
    nutritionPer100g: { type: mongoose.Schema.Types.Mixed, default: {} },
    allergens: { type: [String], default: [] },
    certifications: { type: [String], default: [] },

    status: { type: String, enum: ["active", "hidden", "discontinued"], default: "active" },
    createdBy: { type: String, ref: "User", required: true },
  },
  { timestamps: true }
);

productSchema.index({ companyId: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);
