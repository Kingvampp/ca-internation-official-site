'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';

export default function ChatPanel({ isOpen, messages, inputValue, isLoading, onClose, onInputChange, onSubmit }) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  if (!isOpen) return null;

  return (
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
        <button onClick={onClose} className="text-white hover:text-gray-200">
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
      <form onSubmit={onSubmit} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={onInputChange}
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
  );
} 