const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose
      .connect(mongoURI, {
        dbName,
      })
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
      });
  }
}

module.exports = new Database();
