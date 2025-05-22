import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import User from "../Models/UserModel.js";
import { userVerification } from "../Middlewares/AuthMiddleware.js";
import { Readable } from "stream";
import path from "path";
import fs from "fs";

const router = express.Router();

// Connect to MongoDB for GridFS
const conn = mongoose.createConnection(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gridFSBucket;
conn.once("open", () => {
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "avatars" });
  console.log("📁 Avatar GridFS Initialized");
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    // Accept only png and jpg files
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error("Only PNG and JPG files are allowed"), false);
    }
  }
});

// Get available default avatars
router.get("/defaults", (req, res) => {
  try {
    // Define the path to the avatars directory
    const avatarsDir = path.join(process.cwd(), "public", "avatars");
    
    // Read the directory to get all avatar files
    const avatarFiles = fs.readdirSync(avatarsDir)
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg'))
      .map(file => ({
        id: file.split('.')[0],
        path: `/avatars/${file}`
      }));
    
    res.json({ avatars: avatarFiles });
  } catch (error) {
    console.error("Error fetching default avatars:", error);
    res.status(500).json({ error: "Failed to fetch default avatars" });
  }
});


router.get("/test", (req, res) => {
    res.json({ message: "Profile pic route is working" });
});

// Set user's profile picture to a default avatar
router.post("/set-default", userVerification, async (req, res) => {
  try {
    const { avatarId } = req.body;
    
    if (!avatarId) {
      return res.status(400).json({ error: "Avatar ID is required" });
    }
    
    // Update user's profile picture field
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: `default:${avatarId}` },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Profile picture updated successfully",
      profilePicture: updatedUser.profilePicture
    });
  } catch (error) {
    console.error("Error setting default avatar:", error);
    res.status(500).json({ error: "Failed to set default avatar" });
  }
});

// Upload a custom profile picture
router.post("/upload", userVerification, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Delete previous custom avatar if exists
    const user = await User.findById(req.user._id);
    if (user.profilePicture && user.profilePicture.startsWith("custom:")) {
      const oldAvatarId = user.profilePicture.split(":")[1];
      try {
        await gridFSBucket.delete(new mongoose.Types.ObjectId(oldAvatarId));
      } catch (err) {
        console.error("Error deleting old avatar:", err);
        // Continue even if delete fails
      }
    }

    // Create a readable stream from the buffer
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    // Create a unique filename
    const filename = `${req.user._id}_${Date.now()}_${req.file.originalname}`;
    
    // Upload to GridFS
    const uploadStream = gridFSBucket.openUploadStream(filename, {
      metadata: { userId: req.user._id.toString() }
    });

    // Pipe the readable stream to the upload stream
    readableStream.pipe(uploadStream);

    // Handle upload completion
    uploadStream.on("finish", async (file) => {
      // Update user's profile picture field with the GridFS file ID
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { profilePicture: `custom:${file._id}` },
        { new: true }
      );

      res.status(201).json({
        success: true,
        message: "Profile picture uploaded successfully",
        profilePicture: updatedUser.profilePicture
      });
    });

    // Handle upload error
    uploadStream.on("error", (error) => {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ error: "Failed to upload avatar" });
    });
  } catch (error) {
    console.error("Error in avatar upload:", error);
    res.status(500).json({ error: "An error occurred during upload" });
  }
});

// Get user's current profile picture
router.get("/current", userVerification, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ profilePicture: user.profilePicture || null });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).json({ error: "Failed to fetch profile picture" });
  }
});

// Stream a profile picture by ID
router.get("/image/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    
    if (type === "default") {
      // Serve a default avatar from the public directory
      const avatarPath = path.join(process.cwd(), "public", "avatars", `${id}.png`);
      
      if (fs.existsSync(avatarPath)) {
        return res.sendFile(avatarPath);
      } else {
        return res.status(404).json({ error: "Default avatar not found" });
      }
    } else if (type === "custom") {
      // Stream a custom avatar from GridFS
      const fileId = new mongoose.Types.ObjectId(id);
      
      // Check if file exists
      const file = await conn.db.collection("avatars.files").findOne({ _id: fileId });
      if (!file) {
        return res.status(404).json({ error: "Avatar not found" });
      }
      
      // Set appropriate content type
      res.set("Content-Type", file.contentType || "image/png");
      
      // Stream the file
      const downloadStream = gridFSBucket.openDownloadStream(fileId);
      downloadStream.pipe(res);
    } else {
      return res.status(400).json({ error: "Invalid avatar type" });
    }
  } catch (error) {
    console.error("Error streaming avatar:", error);
    res.status(500).json({ error: "Failed to stream avatar" });
  }
});

export default router;
