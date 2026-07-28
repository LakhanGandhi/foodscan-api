const asyncHandler = require("../utils/asyncHandler");
const analyticsService = require("../services/analytics.service");

const getSummary = asyncHandler(async (req, res) => {
  const summary = await analyticsService.getSummary(req.companyScope);
  res.status(200).json({ success: true, data: summary, error: null });
});

module.exports = { getSummary };
