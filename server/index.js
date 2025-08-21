import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import routes
import authRoutes from "./routes/authRoutes.js";

// Load environment variables
dotenv.config();

// Initialize app and DB
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// CORS Configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  })
);

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);



// Root route
app.get("/", (req, res) => {
  console.log("Backend is running!");
  res.send("Backend is running!");
});

// Start server and store instance for shutdown
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown (important for Render)
process.on("SIGTERM", () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
