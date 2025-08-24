import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration MongoDB
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_CLUSTER = process.env.MONGODB_CLUSTER;

app.use(cors());
app.use(express.json());

mongoose
  .connect(
    `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}`
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use("/api/auth", authRoutes);

export default app;
