import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOptions = {
  origin: process.env.URL,
  credentials: true,
};
app.use(cors(corsOptions));

// API routes
console.log("Loading user routes...");
app.use("/api/v1/user", userRoute);

console.log("Loading post routes...");
app.use("/api/v1/post", postRoute);

console.log("Loading message routes...");
app.use("/api/v1/message", messageRoute);

console.log("All routes loaded successfully!");

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Serve React build (production)
const reactBuildPath = path.join(__dirname, "../client/build");
app.use(express.static(reactBuildPath));

// React Router fallback (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(reactBuildPath, "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error", success: false });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});