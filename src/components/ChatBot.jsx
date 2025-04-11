import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function ChatBot() {
  // Initialize hooks at the top level
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant for CA Automotive. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Use i18n hooks
  const { t } = useTranslation();
  
  // Create refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check for client-side rendering after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Return null during server-side rendering
  if (!isClient) {
    return null;
  }

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Get all messages except system ones for the API call
      const messagesToSend = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .concat(userMessage);
      
      // For now, use mockAIResponse
      const data = await mockAIResponse(messagesToSend);
      
      // Make sure we're using the right property name
      const responseText = data.response || data.text || "Sorry, I couldn't process that request.";
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: responseText
      }]);
      
      // If the AI recommends booking, show the booking button
      if (data.showBookingButton) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Would you like to book an appointment now?',
          showBookingButton: true 
        }]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again or contact us directly.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock AI response function - this would be replaced with actual API call in production
  const mockAIResponse = async (messages) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the last user message
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      const input_lower = lastUserMessage.content.toLowerCase();
      
      // Simple keyword matching for demo purposes
      if (input_lower.includes('book') || input_lower.includes('appointment') || input_lower.includes('schedule')) {
        return {
          text: "Our booking process is simple! You can schedule an appointment by providing your vehicle details, service needed, and preferred date/time. We will confirm your appointment as soon as possible.",
          showBookingButton: true
        };
      } else if (input_lower.includes('insurance') || input_lower.includes('claim')) {
        return {
          text: "We work with all major insurance companies. After an incident, file a claim with your insurance first, then bring their estimate to us. We handle direct billing with most insurance companies and can help navigate the process.",
          showBookingButton: false
        };
      } else if (input_lower.includes('service') || input_lower.includes('repair') || input_lower.includes('fix')) {
        return {
          text: "We offer comprehensive services including collision repair, paint services, frame straightening, dent repair, and classic car restoration. All work is performed by certified technicians and backed by our warranty.",
          showBookingButton: false
        };
      } else if (input_lower.includes('cost') || input_lower.includes('price') || input_lower.includes('quote') || input_lower.includes('estimate')) {
        return {
          text: "Prices vary depending on the service and your vehicle. We provide free estimates for all services. Would you like to book an appointment for an estimate?",
          showBookingButton: true
        };
      } else if (input_lower.includes('mercedes') || input_lower.includes('specialist')) {
        return {
          text: "We are certified Mercedes-Benz specialists with extensive experience working on luxury vehicles. Our technicians are trained to maintain the highest standards required for premium automobiles.",
          showBookingButton: false
        };
      } else if (input_lower.includes('location') || input_lower.includes('address') || input_lower.includes('where')) {
        return {
          text: "We are located in San Francisco and serve the entire Bay Area. You can find our exact address and directions on our contact page.",
          showBookingButton: false
        };
      } else {
        return {
          text: "Thank you for your question. Our team at CA Automotive specializes in high-quality auto body repair with over 20 years of experience. Is there something specific about our services you'd like to know?",
          showBookingButton: false
        };
      }
    } catch (error) {
      console.error('Error in mockAIResponse:', error);
      return {
        text: "I'm sorry, I encountered an error. Please try again or contact us directly.",
        showBookingButton: false
      };
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-red-600 transition-all duration-300 z-50 border-4 border-blue-600"
        aria-label="Chat with AI assistant"
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
      
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white p-1 rounded-full mr-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="font-bold">CA Automotive Assistant</h3>
            </div>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}>
                <div 
                  className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {message.content}
                  
                  {message.showBookingButton && (
                    <Link 
                      href="/booking" 
                      className="block mt-2 bg-green-500 hover:bg-green-600 text-white text-center py-2 px-4 rounded-md font-medium transition-colors"
                    >
                      Book Appointment
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="mb-4">
                <div className="inline-block p-3 rounded-lg max-w-[80%] bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isLoading || !inputValue.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              This AI assistant is trained on CA Automotive information
            </div>
          </form>
        </div>
      )}
    </>
  );
} 