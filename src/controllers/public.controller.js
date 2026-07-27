const asyncHandler = require("../utils/asyncHandler");
const publicService = require("../services/public.service");

const getProduct = asyncHandler(async (req, res) => {
  const view = await publicService.getPublicProductView(req.params.id);
  res.status(200).json({ success: true, data: view, error: null });
});

module.exports = { getProduct };
