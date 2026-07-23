const mongoose = require("mongoose");
const generateId = require("../utils/idGenerator");
const ROLES = require("../utils/roles");

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => generateId("USR") },
    companyId: { type: String, ref: "Company", default: null }, // null for Super Admin
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: Object.values(ROLES), required: true },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
