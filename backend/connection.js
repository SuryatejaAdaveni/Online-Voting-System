const mongoose = require("mongoose");

const URI =
  "mongodb+srv://vamshiambati:venu9985@cluster0.edeyz18.mongodb.net/online-voting-system?retryWrites=true&w=majority";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = { connectMongoDB };
