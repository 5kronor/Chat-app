import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const MAX_MESSAGES = 50;

function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [input, setInput] = useState('');
  const [announcementInput, setAnnouncementInput] = useState('');
  const [connection, setConnection] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5251/chathub')
      .withAutomaticReconnect()
      .build();

    conn.on('ReceiveMessage', (username, message, role) => {
      setMessages(prev => {
        const updated = [...prev, { username, message, role }];
        return updated.slice(-MAX_MESSAGES);
      });
    });

    conn.on('ReceiveAnnouncement', (username, message) => {
      setAnnouncements(prev => {
        const updated = [...prev, { username, message }];
        return updated.slice(-MAX_MESSAGES);
      });
    });

    conn.on('UserConnected', () => {
      setMessages(prev => [...prev, { username: 'System', message: 'A user joined the chat.', role: 'system' }]);
    });

    conn.on('UserDisconnected', () => {
      setMessages(prev => [...prev, { username: 'System', message: 'A user left the chat.', role: 'system' }]);
    });

    conn.start()
      .then(() => setConnection(conn))
      .catch(err => console.error('Connection error:', err));

    return () => conn.stop();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !connection) return;
    await connection.invoke('SendMessage', user.name, input.trim(), user.role);
    setInput('');
  };

  const sendAnnouncement = async () => {
    if (!announcementInput.trim() || !connection) return;
    try {
      await connection.invoke('SendAnnouncement', user.name, announcementInput.trim(), user.role);
      setAnnouncementInput('');
    } catch (err) {
      alert('Only teachers can send announcements!');
    }
  };

  return (
    <div className="chat-container">
      <h2>Course Chat – {user.name} ({user.role})</h2>

      <div className="announcements">
        <h3>📢 Announcements</h3>
        {announcements.map((a, i) => (
          <div key={i} className="announcement-message">
            <strong>{a.username}:</strong> {a.message}
          </div>
        ))}
        {user.role === 'teacher' && (
          <div className="input-row">
            <input
              type="text"
              placeholder="Write an announcement..."
              value={announcementInput}
              onChange={e => setAnnouncementInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendAnnouncement()}
            />
            <button onClick={sendAnnouncement}>Post</button>
          </div>
        )}
      </div>

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <strong>{m.username}:</strong> {m.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-row">
        <input
          type="text"
          placeholder="Write a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;