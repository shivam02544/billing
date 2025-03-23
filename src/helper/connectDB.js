import mongoose from "mongoose";

const url = process.env.DB_URL;

export const connectDb = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log("Already connected to MongoDB");
    return;
  }
  if (mongoose.connection.readyState === 2) {
    console.log("Connecting...");
    return;
  }

  try {
    await mongoose.connect(url, {
      dbName: "newnpps",
      bufferCommands: true, // Enable buffering to avoid errors
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};
