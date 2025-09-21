const mongoose = require("mongoose");

const URI =
  "mongodb+srv://vamshiambati:venu9985@cluster0.edeyz18.mongodb.net/admin-panel?retryWrites=true&w=majority&appName=Cluster0";

const mongoDbConnect = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit the app if connection fails
  }
};

module.exports = { mongoDbConnect };
