const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const companyRoutes = require("./company.routes");
const auditLogRoutes = require("./auditLog.routes");
const plantRoutes = require("./plant.routes");
const productRoutes = require("./product.routes");
const userRoutes = require("./user.routes");
const publicRoutes = require("./public.routes");
const analyticsRoutes = require("./analytics.routes");
const brandRoutes = require("./brand.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/companies", companyRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/plants", plantRoutes);
router.use("/products", productRoutes);
router.use("/users", userRoutes);
router.use("/public", publicRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/brands", brandRoutes);

module.exports = router;
