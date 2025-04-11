'use client';

import { useState } from 'react';

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'agent', text: string }[]>([
    { sender: 'agent', text: 'Hello! How can we help you today?' },
  ]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to chat
    setChatHistory([...chatHistory, { sender: 'user', text: message }]);
    
    // Clear input
    setMessage('');
    
    // Simulate agent response after a short delay
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev, 
        { 
          sender: 'agent', 
          text: "Thanks for your message! Our team will get back to you shortly. If you'd like to schedule an appointment, please call us or use our booking page." 
        }
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="bg-[var(--accent)] text-white p-4 rounded-full shadow-lg hover:bg-[#cc0000] transition-colors"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[var(--primary)] text-white p-4">
            <h3 className="font-bold">Chat with Us</h3>
            <p className="text-sm opacity-80">Need a quote? Ask now!</p>
          </div>
          
          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-gray-50">
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-3 ${
                  msg.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg ${
                    msg.sender === 'user' 
                      ? 'bg-[var(--accent)] text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
              <button
                type="submit"
                className="bg-[var(--accent)] text-white p-2 rounded-r-md hover:bg-[#cc0000]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveChat; 