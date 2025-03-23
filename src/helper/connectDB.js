import mongoose from "mongoose";
const url = process.env.DB_URL;
export const connectDb = async () => {
  const connectionState = mongoose.connection.readyState;
  if (connectionState == 1) {
    console.log("already connected");
    return;
  }
  if (connectionState == 2) {
    console.log("Connecting...");
    return;
  }
  try {
    await mongoose.connect(url, {
      dbName: "newnpps",
      bufferCommands: false,
    });
    console.log("connected");
  } catch (e) {
    console.log("Error: " + e);
  }
};
