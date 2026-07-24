const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const scopeToCompany = require("../middleware/scopeToCompany");
const validate = require("../middleware/validate");
const ROLES = require("../utils/roles");
const {
  createCompanyValidator,
  updateCompanyValidator,
  changeStatusValidator,
  createCompanyAdminValidator,
} = require("../validation/company.validation");
const companyController = require("../controllers/company.controller");

const router = express.Router();

router.use(authenticate);

// Super Admin only: create, list all, change status, delete, create a company's admin
router.post("/", authorize(ROLES.SUPER_ADMIN), validate(createCompanyValidator), companyController.create);
router.get("/", authorize(ROLES.SUPER_ADMIN), companyController.list);
router.patch("/:id/status", authorize(ROLES.SUPER_ADMIN), validate(changeStatusValidator), companyController.changeStatus);
router.delete("/:id", authorize(ROLES.SUPER_ADMIN), companyController.remove);
router.post("/:id/admin", authorize(ROLES.SUPER_ADMIN), validate(createCompanyAdminValidator), companyController.createAdmin);

// Super Admin (any company) or Company Admin/Employee (own company only, enforced by scopeToCompany + service)
router.get(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.COMPANY_EMPLOYEE),
  scopeToCompany,
  companyController.getById
);
router.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN),
  scopeToCompany,
  validate(updateCompanyValidator),
  companyController.update
);

module.exports = router;
