/**
 * Free IP geolocation lookup (same approach as the original prototype).
 * Returns city-level location only - never precise coordinates.
 */
async function lookupGeo(ip) {
  if (!ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("::ffff:127.")) {
    return { country: "Local", region: "Local", city: "Local" };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);
    const data = await res.json();
    if (data.status !== "success") return { country: "Unknown", region: "Unknown", city: "Unknown" };
    return { country: data.country || "Unknown", region: data.regionName || "Unknown", city: data.city || "Unknown" };
  } catch (err) {
    return { country: "Unknown", region: "Unknown", city: "Unknown" };
  }
}

module.exports = { lookupGeo };
