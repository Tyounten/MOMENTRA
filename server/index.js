import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./socket/socket.js";
import mongoose from "mongoose";
 
dotenv.config();

const PORT = process.env.PORT || 8000;

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const corsOptions = {
    origin: process.env.URL, // e.g., "http://localhost:5173"
    credentials: true
}
app.use(cors(corsOptions));

// API
console.log("Loading user routes...");
app.use("/api/v1/user", userRoute);

console.log("Loading post routes...");
app.use("/api/v1/post", postRoute);

console.log("Loading message routes...");
app.use("/api/v1/message", messageRoute);

console.log("All routes loaded successfully!");

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error', success: false });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});