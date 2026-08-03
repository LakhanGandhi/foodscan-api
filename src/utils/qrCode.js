const QRCode = require("qrcode");
const env = require("../config/env");

// QR codes now encode a BATCH id, not a product id - each physical
// package belongs to one production run, and that's what needs to be
// scannable (mfg/expiry dates, which plant, etc).
function buildPublicBatchUrl(batchId) {
  const base = env.publicSiteBaseUrl.replace(/\/$/, "");
  return `${base}/?id=${encodeURIComponent(batchId)}`;
}

function generateQrPngBuffer(url) {
  return QRCode.toBuffer(url, { type: "png", margin: 2, width: 400 });
}

function generateQrDataUrl(url) {
  return QRCode.toDataURL(url, { margin: 2, width: 400 });
}

module.exports = { buildPublicBatchUrl, generateQrPngBuffer, generateQrDataUrl };
