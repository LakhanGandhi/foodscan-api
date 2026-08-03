const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const scopeToCompany = require("../middleware/scopeToCompany");
const validate = require("../middleware/validate");
const ROLES = require("../utils/roles");
const { createBatchValidator, updateBatchValidator } = require("../validation/batch.validation");
const batchController = require("../controllers/batch.controller");

const router = express.Router();
const ALL_ROLES = [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.COMPANY_EMPLOYEE];

router.use(authenticate);

router.post("/", authorize(...ALL_ROLES), validate(createBatchValidator), batchController.create);
router.get("/", authorize(...ALL_ROLES), scopeToCompany, batchController.list);
router.get("/:id", authorize(...ALL_ROLES), scopeToCompany, batchController.getById);
router.patch("/:id", authorize(...ALL_ROLES), scopeToCompany, validate(updateBatchValidator), batchController.update);

router.get("/:id/qr-url", authorize(...ALL_ROLES), scopeToCompany, batchController.getQrUrl);
router.get("/:id/qr", authorize(...ALL_ROLES), scopeToCompany, batchController.getQrImage);

module.exports = router;
