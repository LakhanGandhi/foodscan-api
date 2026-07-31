const mongoose = require("mongoose");
const generateId = require("../utils/idGenerator");

const companySchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => generateId("CMP") },

    companyName: { type: String, required: true, trim: true },
    legalCompanyName: { type: String, required: true, trim: true },
    companyType: { type: String, required: true, trim: true },
    gstNumber: { type: String, required: true, trim: true, uppercase: true, unique: true },
    panNumber: { type: String, trim: true, default: null },
    cinNumber: { type: String, trim: true, default: null },
    fssaiLicense: { type: String, trim: true, default: null },
    website: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },

    address: {
      line1: { type: String, required: true, trim: true },
      line2: { type: String, trim: true, default: null },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      pinCode: { type: String, required: true, trim: true },
    },

    logoUrl: { type: String, default: null },

    status: {
      type: String,
      enum: ["pending", "approved", "disabled", "suspended"],
      default: "pending",
    },
    createdBy: { type: String, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
