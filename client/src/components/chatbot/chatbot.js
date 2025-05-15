import React, { useState } from 'react';
import '../../styles/chatbot.css'

const Chatbot = () => {
  const [messages, setMessages] = useState([]);      // Chat history: { sender: 'user'|'bot', text: string, references?: [] }
  const [input, setInput] = useState('');            // Current user input
  const [loading, setLoading] = useState(false);     // Loading indicator for bot response
  const [error, setError] = useState(null);          // Error message, if any

  // Handle form submit to send question
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const question = input.trim();

    // Add the user's question to the chat
    setMessages(prev => [...prev, { sender: 'user', text: question }]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Send POST request to our Vercel serverless function
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      // `data` is expected to have shape: { answer: string, references: [ {id: n, text: snippet}, ... ] }
      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: data.answer, references: data.references || [] }
      ]);
    } catch (err) {
      console.error('Error querying chatbot API:', err);
      setError('Sorry, something went wrong. Please try again.');
      // Optionally, add an error message into chat
      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: "*(Error: failed to get answer)*", references: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`message ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}
          >
            <p><strong>{msg.sender === 'user' ? 'You:' : 'Assistant:'}</strong> {msg.text}</p>
            {/* Display references if present for bot messages */}
            {msg.sender === 'bot' && msg.references && msg.references.length > 0 && (
              <div className="references">
                <strong>References:</strong>
                <ul>
                  {msg.references.map(ref => (
                    <li key={ref.id}>{ref.text}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message bot-msg typing">
            <p><em>Assistant is typing...</em></p>
          </div>
        )}
      </div>
      {error && <div className="error">{error}</div>}
      <form className="chat-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={input} 
          placeholder="Ask a question..." 
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
