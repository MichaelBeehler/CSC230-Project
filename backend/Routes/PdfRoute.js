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
    if (req.user.role !== "faculty" && req.user.role !== "editor") {
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
        const isFaculty = user.role === "faculty" || user.role === "editor";

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
    if (req.user.role !== "faculty" && req.user.role !== "editor") {
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
        type: file.metadata.type || "article",  // Assume 'article' if type is missing
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
  try {
    const { query = "", type = "" } = req.query;

    // Build search conditions
    const searchConditions = {
      filename: { $regex: query, $options: "i" }
    };

    if (type) {
      searchConditions.type = type; // Only match if type is specified
    }

    const searchResults = await conn.db.collection("approved_pdfs")
      .find(searchConditions)
      .sort({ approvedDate: -1 })
      .toArray();  // No limit now

    res.json(searchResults);
  } catch (error) {
    console.error("❌ Error during search:", error);
    res.status(500).json({ error: "An error occurred while searching" });
  }
});

// Comment routes
// Get all comments for a PDF
router.get("/:fileId/comments", authenticateUser, async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Find the PDF document
    const file = await conn.db.collection("pdfs.files").findOne({ 
      _id: new mongoose.Types.ObjectId(fileId) 
    });
    
    if (!file) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    // Check if user has access to this PDF
    const isOwner = file.metadata.uploadedBy.toString() === req.user._id.toString();
    const isFaculty = req.user.role === "faculty" || req.user.role === "editor";
    const isApproved = file.metadata.status === "Approved";
    
    if (!isOwner && !isFaculty && !isApproved) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Find comments for this PDF
    const comments = await conn.db.collection("pdf_comments")
      .find({ pdfId: fileId })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ comments });
  } catch (error) {
    console.error("❌ Error fetching comments:", error);
    res.status(500).json({ error: "An error occurred while fetching comments" });
  }
});

// Add a new comment to a PDF
router.post("/:fileId/comments", authenticateUser, async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }
    
    // Find the PDF document
    const file = await conn.db.collection("pdfs.files").findOne({ 
      _id: new mongoose.Types.ObjectId(fileId) 
    });
    
    if (!file) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    // Check if user has access to this PDF
    const isOwner = file.metadata.uploadedBy.toString() === req.user._id.toString();
    const isFaculty = req.user.role === "faculty" || req.user.role === "editor";
    const isApproved = file.metadata.status === "Approved";
    
    if (!isOwner && !isFaculty && !isApproved) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Create a new comment
    const comment = {
      _id: new mongoose.Types.ObjectId(),
      pdfId: fileId,
      userId: req.user._id,
      author: req.user.username,
      text,
      createdAt: new Date()
    };
    
    // Save the comment
    await conn.db.collection("pdf_comments").insertOne(comment);
    
    res.status(201).json({ comment });
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ error: "An error occurred while adding the comment" });
  }
});

// Delete a comment
router.delete("/:fileId/comments/:commentId", authenticateUser, async (req, res) => {
  try {
    const { fileId, commentId } = req.params;
    
    // Find the comment
    const comment = await conn.db.collection("pdf_comments").findOne({
      _id: new mongoose.Types.ObjectId(commentId),
      pdfId: fileId
    });
    
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    // Check if user is authorized to delete this comment
    const isCommentAuthor = comment.userId.toString() === req.user._id.toString();
    const isFaculty = req.user.role === "faculty" || req.user.role === "editor";
    
    if (!isCommentAuthor && !isFaculty) {
      return res.status(403).json({ error: "Access denied. You can only delete your own comments." });
    }
    
    // Delete the comment
    await conn.db.collection("pdf_comments").deleteOne({
      _id: new mongoose.Types.ObjectId(commentId)
    });
    
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting comment:", error);
    res.status(500).json({ error: "An error occurred while deleting the comment" });
  }
});

// Highlight routes
// Get highlights for a specific PDF
router.get("/:fileId/highlights", authenticateUser, async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Find the PDF document
    const file = await conn.db.collection("pdfs.files").findOne({ 
      _id: new mongoose.Types.ObjectId(fileId) 
    });
    
    if (!file) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    // Check if user has access to this PDF
    const isOwner = file.metadata.uploadedBy.toString() === req.user._id.toString();
    const isFaculty = req.user.role === "faculty" || req.user.role === "editor";
    const isApproved = file.metadata.status === "Approved";
    
    if (!isOwner && !isFaculty && !isApproved) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if the highlights collection exists
    const highlightsCollection = conn.db.collection("pdf_highlights");
    
    // Find highlights for this PDF
    const highlights = await highlightsCollection.findOne({ pdfId: fileId });
    
    if (!highlights) {
      // Return empty array if no highlights found
      return res.json({ highlights: [] });
    }
    
    res.json({ highlights: highlights.items || [] });
  } catch (error) {
    console.error("❌ Error fetching highlights:", error);
    res.status(500).json({ error: "An error occurred while fetching highlights" });
  }
});

// Save a new highlight
router.post("/:fileId/highlights", authenticateUser, async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const { highlight } = req.body;
    
    if (!highlight) {
      return res.status(400).json({ error: "No highlight data provided" });
    }
    
    // Find the PDF document
    const file = await conn.db.collection("pdfs.files").findOne({ 
      _id: new mongoose.Types.ObjectId(fileId) 
    });
    
    if (!file) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    // Check if user has access to this PDF
    const isOwner = file.metadata.uploadedBy.toString() === req.user._id.toString();
    const isFaculty = req.user.role === "faculty" || req.user.role === "editor";
    const isApproved = file.metadata.status === "Approved";
    
    if (!isOwner && !isFaculty && !isApproved) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Add user info to the highlight
    highlight.userId = req.user._id;
    highlight.userName = req.user.username;
    highlight.createdAt = new Date().toISOString();
    
    // Check if we already have highlights for this PDF
    const highlightsCollection = conn.db.collection("pdf_highlights");
    const existingHighlights = await highlightsCollection.findOne({ pdfId: fileId });
    
    if (existingHighlights) {
      // Add to existing highlights
      await highlightsCollection.updateOne(
        { pdfId: fileId },
        { $push: { items: highlight } }
      );
    } else {
      // Create new highlights document
      await highlightsCollection.insertOne({
        pdfId: fileId,
        items: [highlight]
      });
    }
    
    res.status(201).json({ message: "Highlight saved successfully", highlight });
  } catch (error) {
    console.error("❌ Error saving highlight:", error);
    res.status(500).json({ error: "An error occurred while saving the highlight" });
  }
});

// Update an existing highlight
router.put("/:fileId/highlights/:highlightId", authenticateUser, async (req, res) => {
  try {
    const { fileId, highlightId } = req.params;
    const { highlight } = req.body;
    
    if (!highlight) {
      return res.status(400).json({ error: "No highlight data provided" });
    }
    
    // Find the PDF document
    const file = await conn.db.collection("pdfs.files").findOne({ 
      _id: new mongoose.Types.ObjectId(fileId) 
    });
    
    if (!file) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    // Find the highlight to check ownership
    const highlightsCollection = conn.db.collection("pdf_highlights");
    const existingHighlights = await highlightsCollection.findOne({ 
      pdfId: fileId,
      "items.id": highlightId
    });
    
    if (!existingHighlights) {
      return res.status(404).json({ error: "Highlight not found" });
    }
    
    // Find the specific highlight
    const existingHighlight = existingHighlights.items.find(h => h.id === highlightId);
    
    // Check if user is authorized to update this highlight
    const isHighlightAuthor = existingHighlight.userId && 
                             existingHighlight.userId.toString() === req.user._id.toString();
    const isFaculty = req.user.role === "faculty" || req.user.role === "editor";
    
    if (!isHighlightAuthor && !isFaculty) {
      return res.status(403).json({ error: "Access denied. You can only update your own highlights." });
    }
    
    // Preserve the original user info
    highlight.userId = existingHighlight.userId;
    highlight.userName = existingHighlight.userName;
    highlight.updatedAt = new Date().toISOString();
    
    // Update the highlight
    const result = await highlightsCollection.updateOne(
      { 
        pdfId: fileId, 
        "items.id": highlightId 
      },
      { 
        $set: { "items.$": highlight } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Highlight not found" });
    }
    
    res.json({ message: "Highlight updated successfully", highlight });
  } catch (error) {
    console.error("❌ Error updating highlight:", error);
    res.status(500).json({ error: "An error occurred while updating the highlight" });
  }
});

// Delete a highlight
router.delete("/:fileId/highlights/:highlightId", authenticateUser, async (req, res) => {
  try {
    const { fileId, highlightId } = req.params;
    
    // Find the PDF document
    const file = await conn.db.collection("pdfs.files").findOne({ 
      _id: new mongoose.Types.ObjectId(fileId) 
    });
    
    if (!file) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    // Find the highlight to check ownership
    const highlightsCollection = conn.db.collection("pdf_highlights");
    const existingHighlights = await highlightsCollection.findOne({ 
      pdfId: fileId,
      "items.id": highlightId
    });
    
    if (!existingHighlights) {
      return res.status(404).json({ error: "Highlight not found" });
    }
    
    // Find the specific highlight
    const existingHighlight = existingHighlights.items.find(h => h.id === highlightId);
    
    // Check if user is authorized to delete this highlight
    const isHighlightAuthor = existingHighlight.userId && 
                             existingHighlight.userId.toString() === req.user._id.toString();
    const isFaculty = req.user.role === "faculty" || req.user.role === "editor";
    
    if (!isHighlightAuthor && !isFaculty) {
      return res.status(403).json({ error: "Access denied. You can only delete your own highlights." });
    }
    
    // Remove the highlight
    const result = await highlightsCollection.updateOne(
      { pdfId: fileId },
      { $pull: { items: { id: highlightId } } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Highlight not found" });
    }
    
    res.json({ message: "Highlight deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting highlight:", error);
    res.status(500).json({ error: "An error occurred while deleting the highlight" });
  }
});


export default router;



