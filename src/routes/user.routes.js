const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const scopeToCompany = require("../middleware/scopeToCompany");
const validate = require("../middleware/validate");
const ROLES = require("../utils/roles");
const {
  createUserValidator,
  updateUserValidator,
  changeStatusValidator,
  resetPasswordValidator,
} = require("../validation/user.validation");
const userController = require("../controllers/user.controller");

const router = express.Router();
const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN];

router.use(authenticate);

router.post("/", authorize(...ADMIN_ROLES), validate(createUserValidator), userController.create);
router.get("/", authorize(...ADMIN_ROLES), scopeToCompany, userController.list);
router.get("/:id", authorize(...ADMIN_ROLES), scopeToCompany, userController.getById);
router.patch("/:id", authorize(...ADMIN_ROLES), scopeToCompany, validate(updateUserValidator), userController.update);
router.patch(
  "/:id/status",
  authorize(...ADMIN_ROLES),
  scopeToCompany,
  validate(changeStatusValidator),
  userController.changeStatus
);
router.patch(
  "/:id/reset-password",
  authorize(...ADMIN_ROLES),
  scopeToCompany,
  validate(resetPasswordValidator),
  userController.resetPassword
);

module.exports = router;
