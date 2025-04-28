import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../../styles/chatbot.css';
import Header from '../Header/Header';
export default function ChatBot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { text: input, isBot: false };
    
    try {
      setMessages(prev => [...prev, userMessage]);
      
      const { data } = await axios.post('/api/chat', {
        question: input,
        history: messages.filter(m => m.isBot).map(m => m.text)
      });

      setMessages(prev => [
        ...prev,
        { 
          text: data.answer, 
          isBot: true,
          sources: data.sources 
        }
      ]);
      
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { text: "Sorry, I'm having trouble connecting.", isBot: true }
      ]);
    } finally {
      setInput('');
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
    <><Header/> </>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
            <div className="message-content">
              {msg.text}
              {msg.sources && msg.sources.length > 0 && (
                <div className="sources">
                  <div className="source-header">Sources:</div>
                  {msg.sources.map((source, idx) => (
                    <div key={idx} className="source-item">
                      {source.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot loading">
            <div className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about SIP..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Ask'}
        </button>
      </form>
    </div>
  );
}