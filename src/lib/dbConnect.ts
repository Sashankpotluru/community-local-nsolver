// dbConnect.ts
import mongoose from 'mongoose';
import { MongoClient, ServerApiVersion } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri: string = process.env.MONGODB_URI;

// Define the cached mongoose connection type
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare the global mongoose type
declare global {
  var mongoose: MongooseConnection;
}

// Initialize the cached connection
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  try {
    // If we have a connection, return it
    if (global.mongoose.conn) {
      console.log('Using existing mongoose connection');
      return global.mongoose.conn;
    }

    // If we don't have a promise to connect, create one
    if (!global.mongoose.promise) {
      const opts = {
        bufferCommands: true,
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      };

      console.log('Creating new mongoose connection');
      global.mongoose.promise = mongoose.connect(uri, opts);
    }

    // Wait for the connection
    global.mongoose.conn = await global.mongoose.promise;
    console.log('Mongoose connection established');
    
    // Set up connection error handlers
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
      global.mongoose.promise = null;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
      global.mongoose.promise = null;
    });

    return global.mongoose.conn;
  } catch (error) {
    console.error('Mongoose connection error:', error);
    global.mongoose.promise = null;
    throw error;
  }
}

// MongoDB Native Client for direct operations if needed
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function getMongoClient() {
  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error('MongoDB Client Connection Error:', error);
    throw error;
  }
}

// Test connection function
export async function testConnection() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}