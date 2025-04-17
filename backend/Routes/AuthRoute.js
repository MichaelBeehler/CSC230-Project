import {Signup, Login, getProfile, forgotPassword } from "../Controllers/AuthController.js";
import { userVerification } from "../Middlewares/AuthMiddleware.js";
import { Router } from "express";

const router = Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/", userVerification);

router.get("/profile", userVerification, getProfile);
router.post ("/forgotPassword", forgotPassword);

export default router; 