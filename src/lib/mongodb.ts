import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  __vikkmoreMongoClientPromise__?: Promise<MongoClient>;
};

function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI environment variable");

  if (globalForMongo.__vikkmoreMongoClientPromise__) {
    return globalForMongo.__vikkmoreMongoClientPromise__;
  }

  const client = new MongoClient(uri);
  globalForMongo.__vikkmoreMongoClientPromise__ = client.connect();
  return globalForMongo.__vikkmoreMongoClientPromise__;
}

export const getUserLibraryCollection = async () => {
  const connectedClient = await getMongoClientPromise();
  const dbName = process.env.MONGODB_DB_NAME || "vikkmore";
  const collectionName = process.env.MONGODB_COLLECTION_NAME || "userLibraries";
  return connectedClient.db(dbName).collection(collectionName);
};
