import React, { useState } from 'react';
import '../../styles/chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const question = input.trim();

    setMessages(prev => [...prev, { sender: 'user', text: question }]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: data.answer, references: data.references || [] }
      ]);
    } catch (err) {
      console.error('Error querying chatbot API:', err);
      setError('Sorry, something went wrong. Please try again.');
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later.", references: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h1>SIP Expert Assistant</h1>
        <p>Ask me anything about Software Intensive Products</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="message-content">
              {msg.text}
              {msg.references && msg.references.length > 0 && (
                <div className="sources">
                  <div className="source-header">References:</div>
                  {msg.references.map((ref, i) => (
                    <div key={i} className="source-item">{ref.text}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message bot loading">
            <div className="message-content">
              <div className="loading-dots"><span>.</span><span>.</span><span>.</span></div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          placeholder="Type your question about SIP..."
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
