const ScanLog = require("../models/ScanLog");

function buildFilter(companyScope, sinceDate) {
  const filter = {};
  if (companyScope) filter.companyId = companyScope;
  if (sinceDate) filter.scannedAt = { $gte: sinceDate };
  return filter;
}

function countScans(companyScope, sinceDate) {
  return ScanLog.countDocuments(buildFilter(companyScope, sinceDate));
}

function topByField(companyScope, field, limit = 5) {
  return ScanLog.aggregate([
    { $match: buildFilter(companyScope) },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
}

async function visitorStats(companyScope) {
  const results = await ScanLog.aggregate([
    { $match: buildFilter(companyScope) },
    { $group: { _id: "$visitorHash", scanCount: { $sum: 1 } } },
  ]);
  const unique = results.length;
  const returning = results.filter((r) => r.scanCount > 1).length;
  return { unique, returning };
}

module.exports = { countScans, topByField, visitorStats };
