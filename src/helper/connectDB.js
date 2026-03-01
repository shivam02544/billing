import mongoose from "mongoose";
import { validateEnvironment } from "./validateEnv";
import { cookies } from "next/headers";

const url = process.env.DB_URL;

// Cache map for active multi-tenant connections
const cachedConnections = global.mongooseConnections || {};
if (process.env.NODE_ENV !== "production") {
  global.mongooseConnections = cachedConnections;
}

export const connectDb = async () => {
  try {
    // Validate environment variables
    validateEnvironment();

    let session = "2025-2026";
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("currentSession");
      
      if (sessionCookie) {
         session = sessionCookie.value;
      }
    } catch (e) {
      // In case cookies() cannot be evaluated statically
    }

    let targetDbName = "newnpps";
    if (session && session !== "2025-2026") {
      targetDbName = `npps${session}`;
      console.log(targetDbName);
      
    }

    // Check if we already have a cached connection for this specific DB
    if (cachedConnections[targetDbName]) {
      const conn = cachedConnections[targetDbName];
      if (conn.readyState === 1 || conn.readyState === 2) {
        // Return active or currently connecting connection
        return conn;
      }
    }

    // Create a brand new, isolated connection
    console.log(`Establishing isolated Multi-Tenant connection to: ${targetDbName}`);
    
    // Instead of mongoose.connect (global), we create an isolated connection
    const connection = mongoose.createConnection(url, {
      dbName: targetDbName,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Handle connection events for debugging
    connection.on('connected', () => {
      console.log(`MongoDB successfully connected to: ${targetDbName}`);
    });

    connection.on('error', (err) => {
      console.error(`MongoDB connection error on ${targetDbName}:`, err);
    });

    // Cache it
    cachedConnections[targetDbName] = connection;
    
    // Make sure it connects before returning but we can also return it immediately because Mongoose buffers
    return connection;

  } catch (error) {
    console.error("MongoDB Connection Logic Error:", error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    for (const [dbName, conn] of Object.entries(cachedConnections)) {
      if (conn.readyState !== 0) {
        await conn.close();
        console.log(`Closed isolated connection to ${dbName}`);
      }
    }
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connections:', error);
    process.exit(1);
  }
});
