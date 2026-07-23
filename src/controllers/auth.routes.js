const express = require("express");
const rateLimit = require("express-rate-limit");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");
const {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  bootstrapValidator,
} = require("../validation/auth.validation");
const authController = require("../controllers/auth.controller");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: { code: "TOO_MANY_REQUESTS", message: "Too many attempts. Please try again later." },
  },
});

router.post("/login", authLimiter, validate(loginValidator), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", authLimiter, validate(forgotPasswordValidator), authController.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordValidator), authController.resetPassword);
router.post("/bootstrap-super-admin", authLimiter, validate(bootstrapValidator), authController.bootstrapSuperAdmin);
router.get("/me", authenticate, authController.me);

module.exports = router;
