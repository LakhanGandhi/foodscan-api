function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `No route matches ${req.method} ${req.originalUrl}`,
    },
  });
}

module.exports = notFound;
