const express = require("express");
const rateLimit = require("express-rate-limit");
const publicController = require("../controllers/public.controller");

const router = express.Router();

// This is the only endpoint with zero authentication, so it gets its own
// limiter rather than relying solely on the app-wide baseline in app.js.
// Generous enough for a real person scanning a package a few times, tight
// enough to slow down scraping/enumeration attempts against product IDs.
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

router.get("/products/:id", publicLimiter, publicController.getProduct);

module.exports = router;
