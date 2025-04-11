'use client';

import React, { useState, useEffect } from 'react';

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant for CA Automotive. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [mounted, setMounted] = useState(false);

  // Add debugging to confirm component is mounting
  useEffect(() => {
    setMounted(true);
    console.log('ChatButton component mounted');
  }, []);

  const toggleChat = () => {
    console.log('Chat toggle clicked');
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    setMessages([...messages, { role: 'user', content: inputValue }]);
    
    // Mock response
    setTimeout(() => {
      setMessages([
        ...messages, 
        { role: 'user', content: inputValue },
        { role: 'assistant', content: 'Thank you for your message. Our team will get back to you shortly. If you need immediate assistance, please call us at (415) 447-4001.' }
      ]);
      setInputValue('');
    }, 1000);
  };

  if (!mounted) {
    return (
      <button 
        className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-[9999]"
      >
        Loading...
      </button>
    );
  }

  return (
    <>
      {/* Chat Button - Extremely high z-index to ensure visibility */}
      <button 
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-red-700 transition-all duration-300 z-[9999]"
        aria-label="Chat with us"
        style={{ zIndex: 9999, boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
      
      {/* Chat Panel - Same extreme z-index */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh] z-[9999]" style={{ zIndex: 9999 }}>
          {/* Header */}
          <div className="bg-red-600 text-white p-4 flex justify-between items-center">
            <h2 className="font-bold">Chat with CA International Autobody</h2>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-red-600 text-white ml-auto' 
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
          
          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
            <div className="flex">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={inputValue}
                onChange={handleInputChange}
              />
              <button 
                type="submit" 
                className="bg-red-600 text-white px-4 py-2 rounded-r-lg hover:bg-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
} 