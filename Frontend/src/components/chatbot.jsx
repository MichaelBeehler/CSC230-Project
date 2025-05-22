import React, { useState, useEffect, useRef } from 'react';
import './chatbot.css';
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hello! I\'m the CIRT chatbot! How can I help you with our research repository today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "How do I upload a poster?",
    "How does the review process work?",
    "How can I search for papers?"
  ]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async (messageText) => {
    if (messageText.trim() === '' || isLoading) return;

    // Add user message
    const userMessage = { text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log("Sending message to backend:", messageText);
      
      const response = await fetch(`${backendUrl}/api/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });
      
      console.log("Response status:", response.status);
      
      // Check if the response is HTML instead of JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Received HTML response instead of JSON. API endpoint may be incorrect.');
      }
      
      // Parse the JSON response
      const data = await response.json();
      console.log("Response data:", data);
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      // Add bot response
      setMessages(prev => [...prev, { 
        text: data.response || 'Sorry, I could not generate a response.', 
        sender: 'bot' 
      }]);
      
      // Generate new suggestions based on the conversation
      generateNewSuggestions(messageText, data.response);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`, 
        sender: 'bot',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  // Generate new contextual suggestions based on the conversation
  const generateNewSuggestions = (userMessage, botResponse) => {
    const lowerUserMsg = userMessage.toLowerCase();
    const lowerBotResp = botResponse.toLowerCase();
    
    // Contextual suggestions based on conversation
    if (lowerUserMsg.includes('upload') || lowerBotResp.includes('upload')) {
      setSuggestions([
        "What file formats are supported?",
        "How long does the review process take?",
        "Can I edit my submission after uploading?"
      ]);
    } else if (lowerUserMsg.includes('search') || lowerBotResp.includes('search')) {
      setSuggestions([
        "Can I search by author name?",
        "How do I download papers?",
        "Are there advanced search options?"
      ]);
    } else if (lowerUserMsg.includes('account') || lowerUserMsg.includes('login') || 
               lowerBotResp.includes('account') || lowerBotResp.includes('login')) {
      setSuggestions([
        "How do I reset my password?",
        "Can I change my user role?",
        "How do I update my profile?"
      ]);
    } else if (lowerUserMsg.includes('review') || lowerBotResp.includes('review')) {
      setSuggestions([
        "Who reviews my submissions?",
        "What are the review criteria?",
        "How will I be notified of review results?"
      ]);
    } else {
      // Default suggestions
      setSuggestions([
        "How do I upload a poster?",
        "How does the review process work?",
        "How can I search for papers?"
      ]);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>CIRT Assistant</h3>
            <button onClick={toggleChatbot}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="chatbot-suggestions">
              {suggestions.map((suggestion, index) => (
                <button 
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          <form onSubmit={handleFormSubmit} className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={toggleChatbot}>
          <span role="img" aria-label="Chat with us">💬</span>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
