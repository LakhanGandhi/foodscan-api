const analyticsRepo = require("../repositories/analytics.repository");
const productRepo = require("../repositories/product.repository");

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000);
}

async function getSummary(companyScope) {
  const [
    totalScans,
    todayScans,
    weeklyScans,
    monthlyScans,
    topProductsRaw,
    topCities,
    topStates,
    topCountries,
    visitors,
  ] = await Promise.all([
    analyticsRepo.countScans(companyScope),
    analyticsRepo.countScans(companyScope, startOfToday()),
    analyticsRepo.countScans(companyScope, daysAgo(7)),
    analyticsRepo.countScans(companyScope, daysAgo(30)),
    analyticsRepo.topByField(companyScope, "productId", 5),
    analyticsRepo.topByField(companyScope, "city", 5),
    analyticsRepo.topByField(companyScope, "region", 5),
    analyticsRepo.topByField(companyScope, "country", 5),
    analyticsRepo.visitorStats(companyScope),
  ]);

  const topProducts = await Promise.all(
    topProductsRaw.map(async (row) => {
      const product = await productRepo.findById(row._id);
      return { productId: row._id, name: product ? product.productName : "Unknown", scans: row.count };
    })
  );

  return {
    totalScans,
    todayScans,
    weeklyScans,
    monthlyScans,
    topProducts,
    topCities: topCities.map((r) => ({ city: r._id, scans: r.count })),
    topStates: topStates.map((r) => ({ state: r._id, scans: r.count })),
    topCountries: topCountries.map((r) => ({ country: r._id, scans: r.count })),
    uniqueVisitors: visitors.unique,
    returningVisitors: visitors.returning,
  };
}

module.exports = { getSummary };
