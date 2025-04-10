import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import dotenv from "dotenv";
import { Readable } from "stream";
import User from "../Models/UserModel.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

const router = express.Router();
router.use(cookieParser());

const conn = mongoose.createConnection(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gridFSBucket;
conn.once("open", () => {
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "pdfs" });
  console.log("📁 GridFS Initialized");
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to verify user authentication
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
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

// Upload PDF with user ownership tracking
router.post("/upload-pdf", authenticateUser, upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📄 Upload request received:", req.file.originalname);

    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    const uploadStream = gridFSBucket.openUploadStream(req.file.originalname, {
      metadata: { uploadedBy: req.user._id, status: "Pending", comment: "" },
    });

    readableStream.pipe(uploadStream);

    uploadStream.on("error", (error) => {
      console.error("❌ GridFS Upload Error:", error);
      return res.status(500).json({ error: "Upload failed" });
    });

    uploadStream.on("finish", () => {
      console.log("✅ File successfully uploaded:", req.file.originalname);
      res.status(201).json({
        message: "File uploaded successfully",
        filename: req.file.originalname,
      });
    });

  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ error: "An error occurred while uploading" });
  }
});

// Upload Poster with user ownership tracking
router.post("/upload-poster", authenticateUser, upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("🖼️ Poster upload request received:", req.file.originalname);

    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    const uploadStream = gridFSBucket.openUploadStream(req.file.originalname, {
      metadata: { uploadedBy: req.user._id, status: "Pending", type: "poster", comment: "" },
    });

    readableStream.pipe(uploadStream);

    uploadStream.on("error", (error) => {
      console.error("❌ GridFS Poster Upload Error:", error);
      return res.status(500).json({ error: "Poster upload failed" });
    });

    uploadStream.on("finish", () => {
      console.log("✅ Poster successfully uploaded:", req.file.originalname);
      res.status(201).json({
        message: "Poster uploaded successfully",
        filename: req.file.originalname,
      });
    });

  } catch (error) {
    console.error("❌ Poster Upload Error:", error);
    res.status(500).json({ error: "An error occurred while uploading poster" });
  }
});

// Fetch all PDFs (Faculty Only)
router.get("/all", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Access denied. Faculty only." });
    }

    const files = await conn.db.collection("pdfs.files").find().toArray();
    res.json(files);
  } catch (error) {
    console.error("❌ Error retrieving all PDFs:", error);
    res.status(500).json({ error: "Server error retrieving PDFs" });
  }
});

// Fetch PDFs uploaded by the logged-in student (With Faculty Comments)
router.get("/my-pdfs", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Access denied. Students only." });
    }

    const files = await conn.db.collection("pdfs.files").find({ 
      "metadata.uploadedBy": req.user._id,
      $or: [
        { "metadata.type": { $exists: false } }, // fallback for older PDFs
        { "metadata.type": "pdf" }
      ]
    }).toArray();

    res.json(files);
  } catch (error) {
    console.error("❌ Error retrieving student PDFs:", error);
    res.status(500).json({ error: "Server error retrieving PDFs" });
  }
});

// Fetch Posters uploaded by the logged-in student
router.get("/my-posters", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Access denied. Students only." });
    }

    const files = await conn.db.collection("pdfs.files").find({ 
      "metadata.uploadedBy": req.user._id,
      "metadata.type": "poster"
    }).toArray();

    res.json(files);
  } catch (error) {
    console.error("❌ Error retrieving student posters:", error);
    res.status(500).json({ error: "Server error retrieving posters" });
  }
});

// ✅ Stream a specific PDF by file ID (public if approved)
router.get("/view/:fileId", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    const file = await conn.db.collection("pdfs.files").findOne({ _id: fileId });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const isApproved = file.metadata.status === "Approved";

    // ✅ If approved, skip all authentication
    if (!isApproved) {
      const token = req.cookies?.token;
      if (!token) {
        return res.status(403).json({ error: "Access denied. PDF not approved and no login." });
      }

      try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(403).json({ error: "Access denied. Invalid user." });
        }

        const isOwner = file.metadata.uploadedBy.toString() === user._id.toString();
        const isFaculty = user.role === "faculty";

        if (!isOwner && !isFaculty) {
          return res.status(403).json({ error: "Access denied. Not your PDF." });
        }
      } catch (err) {
        console.error("❌ JWT Verification Failed:", err.message);
        return res.status(403).json({ error: "Access denied. Invalid or expired login." });
      }
    }

    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", `inline; filename="${file.filename}"`);

    const downloadStream = gridFSBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error("❌ Error streaming file:", error);
    res.status(500).json({ error: "An error occurred while retrieving the file" });
  }
});

// Faculty Approval/Rejection with Comments
router.put("/update-status/:fileId", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Access denied. Faculty only." });
    }

    const { status, comment } = req.body;
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const result = await conn.db.collection("pdfs.files").updateOne(
      { _id: fileId },
      { $set: { "metadata.status": status, "metadata.comment": comment } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "File not found or status unchanged." });
    }

    if (status === "Approved") {
      const file = await conn.db.collection("pdfs.files").findOne({ _id: fileId });
      await conn.db.collection("approved_pdfs").insertOne({
        _id: file._id,
        filename: file.filename,
        uploadedBy: file.metadata.uploadedBy,
        comment,
        approvedDate: new Date()
      });
    }

    res.json({ message: `PDF marked as ${status} with comment.` });
  } catch (error) {
    console.error("❌ Error updating PDF status:", error);
    res.status(500).json({ error: "An error occurred while updating status." });
  }
});

// Search for Approved PDFs
router.get("/search", async (req, res) => {
  const { query } = req.query;
  const searchResults = await conn.db.collection("approved_pdfs")
    .find({ filename: { $regex: query, $options: "i" } })
    .sort({ approvedDate: -1 })
    .limit(3)
    .toArray();

  res.json(searchResults);
});

export default router;



