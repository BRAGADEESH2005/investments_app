import mongoose from "mongoose";

function databaseUri() {
  const value = process.env.MONGODB_URI;
  if (!value) throw new Error("MONGODB_URI is not configured.");
  return value;
}

declare global {
  var mongooseConnection:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const cached = global.mongooseConnection ?? { conn: null, promise: null };
global.mongooseConnection = cached;

export default async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.promise ??= mongoose.connect(databaseUri());
  cached.conn = await cached.promise;
  return cached.conn;
}
