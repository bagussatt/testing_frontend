import React, { useState } from 'react';
import axios from 'axios';

function ChatPage() {
  const [message, setMessage] = useState('');
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('You are not authenticated. Please log in.');
      setIsLoading(false);
      return;
    }

    setReplies((prevReplies) => [...prevReplies, { type: 'user', text: message }]);
    const userMessage = message;
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:3000/api/chat',
        { message: userMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReplies((prevReplies) => [...prevReplies, { type: 'bot', text: response.data.reply }]);
    } catch (err) {
      console.error('Failed to get bot reply:', err.response?.data || err);
      setError('Failed to get bot reply. Your session may have expired.');
      setReplies((prevReplies) => prevReplies.slice(0, prevReplies.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Chat dengan AI</h2>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '400px', overflowY: 'scroll' }}>
        {replies.map((reply, index) => (
          <div key={index} style={{ textAlign: reply.type === 'user' ? 'right' : 'left', margin: '5px' }}>
            <p
              style={{
                backgroundColor: reply.type === 'user' ? '#dcf8c6' : '#f0f0f0',
                padding: '8px',
                borderRadius: '10px',
                display: 'inline-block',
                maxWidth: '70%',
              }}
            >
              {reply.text}
            </p>
          </div>
        ))}
        {isLoading && <p>AI sedang mengetik...</p>}
      </div>
      <form onSubmit={handleSendMessage} style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ketik pesan Anda..."
          style={{ width: '80%', padding: '10px' }}
          disabled={isLoading}
        />
        <button type="submit" style={{ padding: '10px' }} disabled={isLoading}>
          Kirim
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default ChatPage;