import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        
        {/* Chat Button - Direct implementation that will appear on all pages */}
        <div
          id="global-chat-button"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#d00',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 99999999,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          }}
        >
          💬
        </div>
        
        {/* Chat Panel - Initially hidden */}
        <div
          id="global-chat-panel"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '30px',
            width: '350px',
            height: '450px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            display: 'none',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 99999999,
          }}
        >
          <div
            style={{
              backgroundColor: '#d00',
              color: 'white',
              padding: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>Chat with CA International Autobody</div>
            <div 
              id="global-chat-close"
              style={{ cursor: 'pointer' }}
            >
              ✕
            </div>
          </div>
          <div
            id="global-chat-messages"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '15px',
              backgroundColor: '#f5f5f5',
            }}
          >
            <div
              style={{
                backgroundColor: '#f0f0f0',
                color: '#333',
                padding: '10px',
                borderRadius: '10px',
                maxWidth: '85%',
                marginBottom: '10px',
              }}
            >
              Hello! I'm your AI assistant for CA Automotive. How can I help you today?
            </div>
          </div>
          <div
            style={{
              borderTop: '1px solid #eee',
              padding: '15px',
              backgroundColor: 'white',
            }}
          >
            <div style={{ display: 'flex' }}>
              <input
                id="global-chat-input"
                type="text"
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px 0 0 5px',
                  outline: 'none',
                }}
              />
              <button
                id="global-chat-send"
                style={{
                  backgroundColor: '#d00',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0 5px 5px 0',
                  padding: '0 15px',
                  cursor: 'pointer',
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>
        
        {/* Chat functionality script */}
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const chatButton = document.getElementById('global-chat-button');
              const chatPanel = document.getElementById('global-chat-panel');
              const chatClose = document.getElementById('global-chat-close');
              const chatInput = document.getElementById('global-chat-input');
              const chatSend = document.getElementById('global-chat-send');
              const chatMessages = document.getElementById('global-chat-messages');
              
              // Toggle chat panel
              chatButton.addEventListener('click', function() {
                if (chatPanel.style.display === 'none') {
                  chatPanel.style.display = 'flex';
                } else {
                  chatPanel.style.display = 'none';
                }
              });
              
              // Close chat panel
              chatClose.addEventListener('click', function() {
                chatPanel.style.display = 'none';
              });
              
              // Send message when clicking send button
              chatSend.addEventListener('click', sendMessage);
              
              // Send message when pressing Enter in input field
              chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              });
              
              function sendMessage() {
                const message = chatInput.value.trim();
                if (!message) return;
                
                // Add user message
                const userMessage = document.createElement('div');
                userMessage.style.backgroundColor = '#d00';
                userMessage.style.color = 'white';
                userMessage.style.padding = '10px';
                userMessage.style.borderRadius = '10px';
                userMessage.style.maxWidth = '85%';
                userMessage.style.marginLeft = 'auto';
                userMessage.style.marginBottom = '10px';
                userMessage.textContent = message;
                chatMessages.appendChild(userMessage);
                
                // Clear input
                chatInput.value = '';
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // Add AI response after a short delay
                setTimeout(function() {
                  const aiMessage = document.createElement('div');
                  aiMessage.style.backgroundColor = '#f0f0f0';
                  aiMessage.style.color = '#333';
                  aiMessage.style.padding = '10px';
                  aiMessage.style.borderRadius = '10px';
                  aiMessage.style.maxWidth = '85%';
                  aiMessage.style.marginBottom = '10px';
                  aiMessage.textContent = 'Thank you for your message. Our team will get back to you shortly. If you need immediate assistance, please call us at (415) 447-4001.';
                  chatMessages.appendChild(aiMessage);
                  
                  // Scroll to bottom again
                  chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 1000);
              }
            });
          `
        }} />
      </body>
    </Html>
  );
} 