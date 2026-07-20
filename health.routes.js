const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { getHealth } = require("../controllers/health.controller");

const router = express.Router();

router.get("/", asyncHandler(getHealth));

module.exports = router;
