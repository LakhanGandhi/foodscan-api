const mongoose = require("mongoose");
const env = require("./env");

mongoose.connection.on("connected", () => {
  console.log(`[mongoose] connected to database "${env.dbName}"`);
});

mongoose.connection.on("error", (err) => {
  console.error("[mongoose] connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[mongoose] disconnected");
});

async function connectDB() {
  await mongoose.connect(env.mongodbUri, {
    dbName: env.dbName,
  });
  return mongoose.connection;
}

module.exports = { connectDB, mongoose };
