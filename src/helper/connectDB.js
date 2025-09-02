import mongoose from "mongoose";
import { validateEnvironment } from "./validateEnv";

const url = process.env.DB_URL;

export const connectDb = async () => {
  try {
    // Validate environment variables
    validateEnvironment();
    
    if (mongoose.connection.readyState === 1) {
      console.log("Already connected to MongoDB");
      return;
    }
    if (mongoose.connection.readyState === 2) {
      console.log("Connecting...");
      return;
    }

    await mongoose.connect(url, {
      dbName: "newnpps",
      bufferCommands: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error; // Re-throw to handle in calling function
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});
