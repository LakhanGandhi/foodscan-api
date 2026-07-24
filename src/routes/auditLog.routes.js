const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const ROLES = require("../utils/roles");
const auditLogController = require("../controllers/auditLog.controller");

const router = express.Router();

router.get("/", authenticate, authorize(ROLES.SUPER_ADMIN), auditLogController.list);

module.exports = router;
