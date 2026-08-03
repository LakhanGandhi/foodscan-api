const asyncHandler = require("../utils/asyncHandler");
const publicService = require("../services/public.service");

const getBatch = asyncHandler(async (req, res) => {
  const view = await publicService.getPublicBatchView(req.params.id, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    referrer: req.headers["referer"] || req.headers["referrer"],
  });
  res.status(200).json({ success: true, data: view, error: null });
});

module.exports = { getBatch };
