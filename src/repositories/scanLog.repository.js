const ScanLog = require("../models/ScanLog");

function record(data) {
  return ScanLog.create(data);
}

module.exports = { record };
