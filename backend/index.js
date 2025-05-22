import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoute from "./Routes/AuthRoute.js";
import pdfRoute from "./Routes/PdfRoute.js"; 
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import profilePicRoute from "./Routes/ProfilePicRoute.js";
import chatbotRoute from "./Routes/chatbotRoute.js";
import fellowsRoute from "./Routes/FellowsRoute.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { MONGO_URL, PORT } = process.env;
const app = express();

mongoose
    .connect(MONGO_URL)
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((err) => console.log(`DB CONNECTION ERROR ${err}`));

// CORS configuration
app.use(
    cors({
        origin: ["http://localhost:5173",
            "https://csc-230-project.vercel.app"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes - make sure the paths are correct
app.use("/api/profile-pic", profilePicRoute);
app.use("/", authRoute);
app.use("/api/pdf", pdfRoute);
app.use("/api/fellows", fellowsRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Fix the chatbot route path to match what the frontend expects
app.use("/api/chatbot", chatbotRoute);


// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

export default app;
