import {Signup, Login, getProfile, forgotPassword, resetPassword } from "../Controllers/AuthController.js";
import { userVerification, isEditor } from "../Middlewares/AuthMiddleware.js";
import { Router } from "express";

const router = Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/", userVerification);

router.get("/profile", userVerification, getProfile);
router.post ("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);

// Get all users
router.get("/users", isEditor, async (req, res) => {
    const users = await User.find({}, "-password");
    res.json(users);
});

// Delete a user
router.delete("/users/:id", isEditor, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Update user role
router.put("/users/:id", isEditor, async (req, res) => {
    const { role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ success: true });
});

export default router; 