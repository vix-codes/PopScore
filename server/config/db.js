async function connectDB() {
  if (process.env.MONGO_URI) {
    console.log("MONGO_URI detected. Connect your database layer here for production persistence.");
    return;
  }

  console.log("Running with local JSON storage. No external database configured.");
}

module.exports = connectDB;
