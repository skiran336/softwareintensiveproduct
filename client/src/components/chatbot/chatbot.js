import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../../styles/chatbot.css';
import Header from '../Header/Header';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const response = await axios.post('/api/chat', { question: input });

      const botMessage = { 
        text: response.data.answer,
        sources: response.data.sources,
        isBot: true
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "⚠️ Oops! I'm having trouble responding. Please try again later.",
        isBot: true 
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      <Header />
      <div className="chatbot-container">
        <h1 className="chatbot-heading"> 💬 SIP Assist </h1>
        <p className="chatbot-subheading">
          Instantly get insights about Software-Intensive Products — ask about hardware specs, software dependencies, versions, and more!
        </p>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
              <div className="message-content">
                <span className="sender-label">{msg.isBot ? '🤖 Bot' : '🧑 You'}</span>
                <p>{msg.text}</p>
                {msg.sources && (
                  <div className="sources">
                    Sources: {msg.sources.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message bot">
              <div className="message-content">
                <span className="sender-label">🤖 Bot</span>
                <p className="loading-dots">Thinking<span>.</span><span>.</span><span>.</span></p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            value={input}
            ref={inputRef}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
