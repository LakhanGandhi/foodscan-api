const QRCode = require("qrcode");
const env = require("../config/env");

function buildPublicProductUrl(productId) {
  const base = env.publicSiteBaseUrl.replace(/\/$/, "");
  return `${base}/?id=${encodeURIComponent(productId)}`;
}

function generateQrPngBuffer(url) {
  return QRCode.toBuffer(url, { type: "png", margin: 2, width: 400 });
}

function generateQrDataUrl(url) {
  return QRCode.toDataURL(url, { margin: 2, width: 400 });
}

module.exports = { buildPublicProductUrl, generateQrPngBuffer, generateQrDataUrl };
