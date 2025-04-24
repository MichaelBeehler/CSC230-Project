import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoute from "./Routes/AuthRoute.js";
import pdfRoute from "./Routes/PdfRoute.js"; 
const app = express();
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import profilePicRoute from "./Routes/ProfilePicRoute.js";
dotenv.config();

const { MONGO_URL, PORT } = process.env;

mongoose
    .connect(MONGO_URL)
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((err) => console.log(`DB CONNECTION ERROR ${err}`));

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

app.use(
    cors({
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        optionsSuccessStatus: 204,
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.options("*", cors());
app.use(cookieParser());
app.use(express.json());
app.use("/api/profile-pic", profilePicRoute);
app.use("/", authRoute);
app.use("/api/pdf", pdfRoute);

export default app;
