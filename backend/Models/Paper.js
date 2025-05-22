/*******************************************
 * Store useful metadata about uploaded papers
 * Code By: Michael Beehler, '27
 * Date Edited: 4/15/2025
 ******************************************/

import mongoose from 'mongoose';

const PaperSchema = new mongoose.Schema({
  gridFsFileId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'fs.files' },
  title: String,
  abstract: String,
  authors: [String],
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  keywords: [String],
  journalSection: String,
  uploadDate: { type: Date, default: Date.now },
  visits: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  status: { type: String, enum: ['under_review', 'published', 'rejected'], default: 'under_review' },
  citationCount: { type: Number, default: 0 },
  tags: [String],


  //finalDecision? 
});

module.exports = mongoose.model('Paper', PaperSchema);
