import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Website content knowledge base
const websiteKnowledge = [
  {
    topic: "upload_poster",
    title: "How to Upload a Poster",
    content: "To upload a poster, log in as a student, navigate to the upload-poster page, fill in the required metadata including title, authors, and abstract, then upload your poster file in PDF format. Your submission will be reviewed by faculty members before publication. Note that only PDF formatted files are accepted for poster uploads."
  },
  {
    topic: "upload_pdf",
    title: "How to Upload a PDF Paper",
    content: "To upload a PDF paper, log in with your student credentials, go to the upload-pdf page, complete the submission form with title, abstract, keywords, and journal section, then upload your PDF file. Your paper will be placed in the review queue for faculty approval. Please note that only PDF formatted files are accepted for paper uploads."
  },
  {
    topic: "review_process",
    title: "The Review Process",
    content: "Once submitted, papers enter the review process. Faculty members can access submissions through the review page, evaluate the content, add annotations, and decide whether to publish or reject the paper. Authors will be notified of the decision."
  },
  {
    topic: "search_papers",
    title: "Searching for Papers",
    content: "To search for papers in the repository, use the search function available on the homepage. You can search by keywords, author names, or titles. Search results will display matching papers with their metadata and download options."
  },
  {
    topic: "user_registration",
    title: "User Registration",
    content: "To register as a new user, click on the Register link, fill in your details including name, email, and password, and select your role (student, faculty, or editor). After registration, you'll receive a confirmation email to verify your account."
  },
  {
    topic: "password_reset",
    title: "Password Reset",
    content: "If you forgot your password, click on the Forgot Password link on the login page. Enter your email address to receive a password reset link. Follow the link to create a new password for your account."
  },
  {
    topic: "student_profile",
    title: "Student Profile Management",
    content: "Students can manage their profiles by logging in and navigating to the profile page. Here you can update your personal information, view your submitted papers, and track their status in the review process."
  },
  {
    topic: "faculty_review",
    title: "Faculty Review Process",
    content: "Faculty members can review submitted papers by logging in and accessing the review page. From there, you can see all papers awaiting review, open them for annotation, and make publication decisions."
  },
  {
    topic: "editor_dashboard",
    title: "Editor Dashboard",
    content: "Editors have access to a special dashboard where they can manage all aspects of the repository, including user management, paper categorization, and system settings. The editor dashboard provides comprehensive control over the platform."
  },
  {
    topic: "file_formats",
    title: "Accepted File Formats",
    content: "Our repository only accepts PDF formatted files for all uploads, including papers and posters. This ensures compatibility, preserves formatting, and maintains document integrity across different devices and platforms. Please convert your documents to PDF format before uploading."
  },
  {
    topic: "navigation",
    title: "Website Navigation",
    content: "To navigate the website, use the menu options at the top of the page. Clicking on 'Criminology Institute for Research and Training' in the header will always take you back to the home page from anywhere on the site. The home page provides access to search functionality and featured publications."
  }
];

// Use in-memory storage instead of file system
let knowledgeBaseCache = null;

// Function to initialize the knowledge base
async function initializeKnowledgeBase() {
  try {
    // Store in memory instead of writing to file
    knowledgeBaseCache = [...websiteKnowledge];
    console.log('Knowledge base initialized successfully (in-memory)');
    return true;
  } catch (error) {
    console.error('Error initializing knowledge base:', error);
    return false;
  }
}

// Function to get the knowledge base
async function getKnowledgeBase() {
  // Return from memory if available
  if (knowledgeBaseCache) {
    return knowledgeBaseCache;
  }
  
  // Initialize if not yet done
  await initializeKnowledgeBase();
  return knowledgeBaseCache;
}

// Function to search the knowledge base
async function searchKnowledgeBase(query) {
  const knowledge = await getKnowledgeBase();
  const queryLower = query.toLowerCase();
  
  // Simple keyword matching
  const results = knowledge.filter(item => {
    return (
      item.title.toLowerCase().includes(queryLower) ||
      item.content.toLowerCase().includes(queryLower) ||
      item.topic.toLowerCase().includes(queryLower)
    );
  });
  
  // Sort by relevance (simple implementation)
  results.sort((a, b) => {
    const aScore = countMatches(a, queryLower);
    const bScore = countMatches(b, queryLower);
    return bScore - aScore;
  });
  
  return results;
}

// Helper function to count keyword matches
function countMatches(item, query) {
  const titleMatches = (item.title.toLowerCase().match(new RegExp(query, 'g')) || []).length;
  const contentMatches = (item.content.toLowerCase().match(new RegExp(query, 'g')) || []).length;
  const topicMatches = (item.topic.toLowerCase().match(new RegExp(query, 'g')) || []).length;
  
  // Title matches are weighted more heavily
  return titleMatches * 3 + contentMatches + topicMatches * 2;
}

export { initializeKnowledgeBase, getKnowledgeBase, searchKnowledgeBase };
