const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let mongoServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // Strictly require MongoDB Atlas in production - no in-memory fallback permitted
  if (process.env.NODE_ENV === 'production') {
    if (!uri || uri.includes('YOUR_MONGODB_ATLAS_CONNECTION_STRING') || uri.includes('localhost') || uri.includes('127.0.0.1')) {
      console.error('[MongoDB Atlas Production Error] Production deployment requires a valid MongoDB Atlas connection URI.');
      console.error('[MongoDB Atlas Production Error] In-memory or local databases are strictly forbidden in production.');
      console.error('[MongoDB Atlas Production Error] Required configuration:');
      console.error('  MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/inflationwise?retryWrites=true&w=majority');
      throw new Error('Valid MongoDB Atlas URI required in production. In-memory databases are disabled in production.');
    }
  }

  if (!uri || uri.includes('YOUR_MONGODB_ATLAS_CONNECTION_STRING')) {
    // If local dev mode is permitted, start MongoDB with disk persistence at data/mongo
    if (process.env.ALLOW_LOCAL_DEV_DB === 'true' || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const isTest = process.env.NODE_ENV === 'test';
        const dbPath = isTest ? undefined : path.join(__dirname, '../../data/mongo');
        if (dbPath && !fs.existsSync(dbPath)) {
          fs.mkdirSync(dbPath, { recursive: true });
        }
        mongoServerInstance = await MongoMemoryServer.create({
          instance: {
            ...(dbPath ? { dbPath, storageEngine: 'wiredTiger' } : {}),
            dbName: 'inflationwise',
          },
        });
        const mongoUri = mongoServerInstance.getUri();
        const conn = await mongoose.connect(mongoUri, { dbName: 'inflationwise' });
        if (isTest) {
          console.log(`[MongoDB Test Mode] Ephemeral in-memory database connected.`);
        } else {
          console.log(`[MongoDB Local Dev Mode] Running with disk persistence at: ${dbPath}`);
          console.log(`[MongoDB Connected] Database: ${conn.connection.name}`);
          console.log('[Notice] To switch to MongoDB Atlas, set MONGO_URI in backend/.env');
        }
        return conn;
      } catch (devDbErr) {
        console.error(`[MongoDB Error] Local development database start failed: ${devDbErr.message}`);
        throw devDbErr;
      }
    }

    console.error('[MongoDB Atlas Error] MONGO_URI is missing or unconfigured in backend/.env.');
    console.error('[MongoDB Atlas Error] Required configuration:');
    console.error('  MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/inflationwise?retryWrites=true&w=majority');
    throw new Error('Valid MongoDB Atlas URI required. Please set MONGO_URI in backend/.env');
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'inflationwise',
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB Connected] Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] Failed to connect to MongoDB Atlas database 'inflationwise': ${error.message}`);
    throw error;
  }
};

module.exports = { connectDB };
