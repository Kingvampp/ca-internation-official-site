'use client';

import React, { useState, useEffect } from 'react';
import ChatButton from './ChatButton';
import ChatPanel from './ChatPanel';

export default function ChatContainer() {
  // Use state to track if the component has mounted
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant for CA Automotive. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Only render on client-side
  useEffect(() => {
    try {
      setMounted(true);
    } catch (error) {
      console.error('Error in ChatContainer mount effect:', error);
    }
  }, []);

  // If not mounted (i.e., server-side), don't render anything
  if (!mounted || typeof window === 'undefined') return null;

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
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
      const response = await mockAIResponse(inputValue);

      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.text
      }]);
      
      // If the response suggests booking, add a booking button
      if (response.showBookingButton) {
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
  const mockAIResponse = async (input) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const input_lower = input.toLowerCase();
    
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
  };

  return (
    <>
      <ChatButton onClick={toggleChat} isOpen={isOpen} />
      <ChatPanel 
        isOpen={isOpen}
        messages={messages}
        inputValue={inputValue}
        isLoading={isLoading}
        onClose={closeChat}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </>
  );
} 