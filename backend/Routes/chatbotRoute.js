import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { initializeKnowledgeBase, searchKnowledgeBase } from '../util/webCrawler.js';
import mongoose from 'mongoose';

dotenv.config();

const router = express.Router();

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get the Paper model from mongoose
let Paper;
try {
  // Try to get the model if it's already registered
  Paper = mongoose.model('Paper');
} catch (e) {
  // If not registered, import it (this is a workaround)
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
  });
  Paper = mongoose.model('Paper', PaperSchema);
}

// Initialize knowledge base on startup - only once
let knowledgeBaseInitialized = false;
if (!knowledgeBaseInitialized) {
  initializeKnowledgeBase()
    .then(() => {
      console.log('Chatbot knowledge base initialized');
      knowledgeBaseInitialized = true;
    })
    .catch(error => {
      console.error('Failed to initialize knowledge base:', error);
    });
}

router.post('/chat', async (req, res) => {
  try {
    console.log("Received chat request:", req.body);
    const { message } = req.body;
    
    if (!message) {
      console.log("No message provided");
      return res.status(400).json({ 
        error: 'No message provided',
        response: 'Please provide a message to continue the conversation.'
      });
    }
    
    // Search the knowledge base for relevant information
    const relevantInfo = await searchKnowledgeBase(message);
    console.log(`Found ${relevantInfo.length} relevant items in knowledge base`);
    
    // Get paper information from database if relevant
    let paperInfo = "";
    if (message.toLowerCase().includes('paper') || 
        message.toLowerCase().includes('research') || 
        message.toLowerCase().includes('publication')) {
      try {
        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(process.env.MONGO_URL);
        }
        
        // Get some basic stats about papers
        const publishedCount = await Paper.countDocuments({ status: 'published' });
        const underReviewCount = await Paper.countDocuments({ status: 'under_review' });
        
        paperInfo = `\nCurrent repository stats: ${publishedCount} published papers, ${underReviewCount} papers under review.`;
      } catch (dbError) {
        console.error('Error fetching paper info:', dbError);
      }
    }
    
    // Create context from relevant information
    let context = "";
    if (relevantInfo.length > 0) {
      context = relevantInfo.map(item => `${item.title}:\n${item.content}`).join('\n\n');
    }
    
    // Add paper info to context
    context += paperInfo;
    
    // Create prompt for OpenAI
    const prompt = `
You are a helpful assistant for a research paper repository website. 
Your name is ResearchBot and you help users navigate the website and understand its features.
Be concise and direct in your answers. Focus only on information about the website.

${context ? `Here is specific information about our website that may help answer the question:\n${context}\n\n` : ''}

User question: ${message}

Please provide a helpful, concise response based on the information provided. If you don't have specific information about a topic, suggest where on the website the user might find that information instead of making up details.
`;

    console.log("Sending request to OpenAI with context from knowledge base");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are ResearchBot, a helpful assistant for a research paper repository website. Be concise and direct in your answers." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300, // Keep responses concise
    });
    
    console.log("Received response from OpenAI");
    
    if (!completion.choices || completion.choices.length === 0) {
      console.log("No choices returned from OpenAI");
      return res.status(500).json({ 
        error: 'No response generated',
        response: 'I apologize, but I could not generate a response. Please try again.'
      });
    }
    
    const responseText = completion.choices[0].message.content;
    console.log("Sending response to client:", responseText.substring(0, 50) + "...");
    
    return res.json({ 
      response: responseText,
      status: 'success'
    });
  } catch (error) {
    console.error('Error with chatbot:', error);
    
    return res.status(500).json({ 
      error: error.message || 'Unknown error',
      response: 'I apologize, but I encountered an error processing your request. Please try again later.'
    });
  }
});

export default router;
