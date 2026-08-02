const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const scopeToCompany = require("../middleware/scopeToCompany");
const validate = require("../middleware/validate");
const ROLES = require("../utils/roles");
const { createProductValidator, updateProductValidator } = require("../validation/product.validation");
const productController = require("../controllers/product.controller");

const router = express.Router();
const ALL_ROLES = [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.COMPANY_EMPLOYEE];

router.use(authenticate);

router.post("/", authorize(...ALL_ROLES), validate(createProductValidator), productController.create);
router.get("/", authorize(...ALL_ROLES), scopeToCompany, productController.list);
router.get("/:id", authorize(...ALL_ROLES), scopeToCompany, productController.getById);
router.patch(
  "/:id",
  authorize(...ALL_ROLES),
  scopeToCompany,
  validate(updateProductValidator),
  productController.update
);
router.delete("/:id", authorize(ROLES.SUPER_ADMIN), productController.remove);

module.exports = router;
