const mongoose = require("mongoose");
const generateId = require("../utils/idGenerator");

const plantSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => generateId("PLT") },
    companyId: { type: String, ref: "Company", required: true, index: true },

    plantName: { type: String, required: true, trim: true },
    plantCode: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    fssaiLicense: { type: String, required: true, trim: true },

    latitude: { type: Number, default: null }, // optional
    longitude: { type: Number, default: null }, // optional

    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdBy: { type: String, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plant", plantSchema);
