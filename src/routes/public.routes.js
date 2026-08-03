const express = require("express");
const rateLimit = require("express-rate-limit");
const publicController = require("../controllers/public.controller");

const router = express.Router();

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." },
  },
});

// The QR code encodes a batch ID, e.g. https://yourdomain.com/?id=BAT_xxxxx
router.get("/batches/:id", publicLimiter, publicController.getBatch);

module.exports = router;
