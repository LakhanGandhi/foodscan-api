const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const scopeToCompany = require("../middleware/scopeToCompany");
const ROLES = require("../utils/roles");
const analyticsController = require("../controllers/analytics.controller");

const router = express.Router();

router.get(
  "/summary",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN),
  scopeToCompany,
  analyticsController.getSummary
);

module.exports = router;
