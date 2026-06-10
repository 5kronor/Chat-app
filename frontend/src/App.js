import React, { useState } from 'react';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [role, setRole] = useState('student');

  const joinChat = () => {
    if (nameInput.trim() === '') return;
    setUser({ name: nameInput.trim(), role });
  };

  if (!user) {
    return (
      <div className="join-container">
        <h1>Course Chat</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && joinChat()}
        />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        <button onClick={joinChat}>Join Chat</button>
      </div>
    );
  }

  return <Chat user={user} />;
}

export default App;