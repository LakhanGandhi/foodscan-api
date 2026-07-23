const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);

// Future modules mount here as they're built, e.g.:
// router.use("/companies", companyRoutes);
// router.use("/plants", plantRoutes);
// router.use("/products", productRoutes);
// router.use("/public", publicRoutes);
// router.use("/analytics", analyticsRoutes);

module.exports = router;
