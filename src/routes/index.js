const express = require("express");
const healthRoutes = require("./health.routes");

const router = express.Router();

router.use("/health", healthRoutes);

// Future modules mount here as they're built, e.g.:
// router.use("/auth", authRoutes);
// router.use("/companies", companyRoutes);
// router.use("/plants", plantRoutes);
// router.use("/products", productRoutes);
// router.use("/public", publicRoutes);
// router.use("/analytics", analyticsRoutes);

module.exports = router;
