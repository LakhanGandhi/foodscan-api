const mongoose = require("mongoose");
const generateId = require("../utils/idGenerator");
const ROLES = require("../utils/roles");

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => generateId("USR") },
    companyId: { type: String, ref: "Company", default: null },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: Object.values(ROLES), required: true },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    isOwner: { type: Boolean, default: false }, // true ONLY for the bootstrapped account - never settable via any API
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
