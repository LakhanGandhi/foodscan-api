const { customAlphabet } = require("nanoid");

// Unambiguous alphabet: no 0/O, 1/I/l - safer if anyone ever has to
// type or read one out loud (support calls, printed labels, etc.)
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const nanoid = customAlphabet(ALPHABET, 10);

/**
 * Generates a prefixed public ID, e.g. generateId("CMP") -> "CMP_QX7MZK2LPT"
 * Used for every entity that's ever exposed in a URL or QR code -
 * never expose a raw Mongo ObjectId publicly.
 */
function generateId(prefix) {
  if (!prefix) throw new Error("generateId requires a prefix, e.g. generateId('CMP')");
  return `${prefix.toUpperCase()}_${nanoid()}`;
}

module.exports = generateId;
