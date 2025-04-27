import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../../styles/chatbot.css';
import Header from '../Header/Header';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setLoading(true);
      const userMessage = { text: input, isBot: false };
      setMessages(prev => [...prev, userMessage]);

      const response = await axios.post('/api/chat', { question: input });
      
      const botMessage = { 
        text: response.data.answer,
        sources: response.data.sources 
      };
      setMessages(prev => [...prev, botMessage]);
      setInput('');
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble responding. Please try again.",
        isBot: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <><Header />
    <div className="chatbot-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
            <div className="message-content">
              {msg.text}
              {msg.sources && (
                <div className="sources">
                  Sources: {msg.sources.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
        
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
    </>
  );
};

export default Chatbot;