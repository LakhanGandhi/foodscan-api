const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const scopeToCompany = require("../middleware/scopeToCompany");
const validate = require("../middleware/validate");
const ROLES = require("../utils/roles");
const { createBrandValidator, updateBrandValidator } = require("../validation/brand.validation");
const brandController = require("../controllers/brand.controller");

const router = express.Router();
const ALL_ROLES = [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.COMPANY_EMPLOYEE];

router.use(authenticate);

router.post("/", authorize(ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN), validate(createBrandValidator), brandController.create);
router.get("/", authorize(...ALL_ROLES), scopeToCompany, brandController.list);
router.get("/:id", authorize(...ALL_ROLES), scopeToCompany, brandController.getById);
router.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN),
  scopeToCompany,
  validate(updateBrandValidator),
  brandController.update
);

module.exports = router;
