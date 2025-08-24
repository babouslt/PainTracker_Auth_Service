import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  // Fermer toute connexion existante
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  // Attendre un peu pour s'assurer que la connexion est fermée
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Utiliser une base de données en mémoire pour les tests UNIQUEMENT
  mongod = await MongoMemoryServer.create({
    instance: {
      dbName: "test-auth-db", // Base de données séparée pour les tests
    },
  });
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});
