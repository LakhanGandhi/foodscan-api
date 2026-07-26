const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const scopeToCompany = require("../middleware/scopeToCompany");
const validate = require("../middleware/validate");
const ROLES = require("../utils/roles");
const { createPlantValidator, updatePlantValidator } = require("../validation/plant.validation");
const plantController = require("../controllers/plant.controller");

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN),
  validate(createPlantValidator),
  plantController.create
);

router.get(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.COMPANY_EMPLOYEE),
  scopeToCompany,
  plantController.list
);

router.get(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.COMPANY_EMPLOYEE),
  scopeToCompany,
  plantController.getById
);

router.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN),
  scopeToCompany,
  validate(updatePlantValidator),
  plantController.update
);

router.delete("/:id", authorize(ROLES.SUPER_ADMIN), plantController.remove);

module.exports = router;
