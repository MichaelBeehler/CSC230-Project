import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Fellow from "../Models/Fellow.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = path.join(__dirname, "../uploads/fellows");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api/fellows
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { name, year, bio, topic, faculty } = req.body;
    const links = JSON.parse(req.body.links || "[]");

    const fellow = new Fellow({
      name,
      year,
      bio,
      topic,
      faculty,
      links,
      photo: req.file.filename,
    });

    await fellow.save();
    res.status(200).json({ message: "Fellow added", fellow });
  } catch (err) {
    console.error("❌ Fellow upload error:", err);
    res.status(500).json({ error: "Failed to add fellow." });
  }
});

// GET /api/fellows
router.get("/", async (req, res) => {
  try {
    const fellows = await Fellow.find().sort({ year: -1 });
    res.json(fellows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fellows." });
  }
});

// DELETE /api/fellows/:id
router.delete("/:id", async (req, res) => {
  try {
    await Fellow.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Fellow deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete fellow." });
  }
});

export default router;
