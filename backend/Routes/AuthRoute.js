import {Signup, Login, getProfile, forgotPassword, resetPassword } from "../Controllers/AuthController.js";
import { userVerification } from "../Middlewares/AuthMiddleware.js";
import { Router } from "express";

const router = Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/", userVerification);

router.get("/profile", userVerification, getProfile);
router.post ("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);

export default router; 