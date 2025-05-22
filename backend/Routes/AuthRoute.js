import {Signup, Login, getProfile, forgotPassword, resetPassword } from "../Controllers/AuthController.js";
import { userVerification } from "../Middlewares/AuthMiddleware.js";
import { Router } from "express";
import jwt from "jsonwebtoken";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Readable } from "stream";
import User from "../Models/UserModel.js";

// Middleware to verify user authentication
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const user = await User.findById(data.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("❌ Authentication Error:", error);
    res.status(500).json({ error: "Server error during authentication" });
  }
};

const router = Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/", userVerification);

router.get("/profile", userVerification, getProfile);
router.post ("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);

// Get all users
router.get("/users", authenticateUser, async (req, res) => {
    try {
        if (req.user.role !== "editor") {
            return res.status(403).json({error: "Access Denied: Editor Only"});
        }
        const users = await User.find({}, "-password");
        res.json(users);
    }
    catch (error) {
        console.error("Error retrieving all users: ", error);
        res.status(500).json({error: "Server error retreiving the users"})
    }
});

// Delete a user
router.delete("/users/:id", authenticateUser, async (req, res) => {
    try {
        if (req.user.role !== "editor") {
            return res.status(403).json({error: "Access Denied: Editor Only"});
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        console.error("Error Deleting user: ", error);
        res.status(500).json({error: "Server error deleting the user"});

    }
});

// Update user role
router.put("/users/:id", authenticateUser, async (req, res) => {

    try {
        if (req.user.role !== "editor") {
            return res.status(403).json({error: "Access Denied: Editor Only"});
        }
        const { role } = req.body;
        await User.findByIdAndUpdate(req.params.id, { role });
        res.json({ success: true });
    }
    catch (error) {
        console.error("Error Updating User: ", error);
        res.status(500).json({error: "Server error updating the user"});

    }
});

export default router; 