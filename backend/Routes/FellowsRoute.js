import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Fellow from "../Models/Fellow.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { Readable } from "stream";

const router = express.Router();

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB Connection and GridFS Bucket
const conn = mongoose.createConnection(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gridFSBucket;
conn.once("open", () => {
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "fellow_photos" });
  console.log("📁 GridFS Bucket Ready");
});

// Multer Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/fellows - Upload Fellow Info + Photo to GridFS
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { name, year, bio, topic, faculty } = req.body;
    const links = JSON.parse(req.body.links || "[]");

    let photoId = null;

    if (req.file) {
      const readableStream = new Readable();
      readableStream.push(req.file.buffer);
      readableStream.push(null);

      const uploadStream = gridFSBucket.openUploadStream(req.file.originalname);
      readableStream.pipe(uploadStream);

      await new Promise((resolve, reject) => {
        uploadStream.on("finish", () => {
          photoId = uploadStream.id;
          resolve();
        });
        uploadStream.on("error", reject);
      });
    }

    const fellow = new Fellow({
      name,
      year,
      bio,
      topic,
      faculty,
      links,
      photoId,
    });

    await fellow.save();
    res.status(200).json({ message: "Fellow added", fellow });
  } catch (err) {
    console.error("❌ Fellow upload error:", err);
    res.status(500).json({ error: "Failed to add fellow." });
  }
});

// GET /api/fellows - Fetch All Fellows
router.get("/", async (req, res) => {
  try {
    const fellows = await Fellow.find().sort({ year: -1 });
    res.json(fellows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fellows." });
  }
});

// GET /api/fellows/photo/:id - Stream Photo by GridFS ID
router.get("/photo/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const file = await conn.db.collection("fellow_photos.files").findOne({ _id: fileId });
    if (!file) return res.status(404).json({ error: "Photo not found" });

    res.set("Content-Type", file.contentType || "image/jpeg");
    const downloadStream = gridFSBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve photo" });
  }
});

// DELETE /api/fellows/:id - Delete Fellow by ID
router.delete("/:id", async (req, res) => {
  try {
    const fellow = await Fellow.findByIdAndDelete(req.params.id);

    if (fellow?.photoId) {
      try {
        await gridFSBucket.delete(new mongoose.Types.ObjectId(fellow.photoId));
      } catch (e) {
        console.warn("⚠️ Failed to delete photo from GridFS:", e.message);
      }
    }

    res.status(200).json({ message: "Fellow deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete fellow." });
  }
});

export default router;
