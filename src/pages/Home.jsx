

import React, { useState, useEffect, useCallback } from "react";
import { useSocket } from '../providers/Socket';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import logoImg from '../assets/logo.png';
import Profile from '../assets/images.jpeg';


const Homepage = () => {
  const { socket } = useSocket();
  const [email, setEmail] = useState('');
  const [roomId, setroomId] = useState('');
   const [menuOpen, setMenuOpen] = useState(false);
  const navigate=useNavigate();

  const handleRoomJoined= useCallback(({roomId})=>{
    navigate(`/room/${roomId}`);
  },[navigate])

  const handlejoinroom = () => {
    if (socket && email && roomId) {
      socket.emit('join-room', { emailId: email, roomId });
      console.log("Data sent to server:", { emailId: email, roomId });
    } else {
      console.warn("Missing socket, email, or roomId");
    }
  };

  // const handlejoinroom=({roomId})=>{
  //      navigate(`/room/${roomId}`)
  // };
  useEffect(()=>{
    socket.on("joined-room",handleRoomJoined);
  return () => {
      socket.off("joined-room", handleRoomJoined);
    };
  },[handleRoomJoined,socket]); 

  return (
    <div className="meet-container">
      <header className="meet-header">
        <img src={logoImg} alt="Logo" className="logo-img" />

        <div className={`right-nav ${menuOpen ? 'open' : ''}`}>
          <nav className="nav-links">
            <a href="/">Products</a>
            <a href="/">AI</a>
            <a href="/">Solutions</a>
            <a href="/">Resources</a>
            <a href="/">Pricing</a>
          </nav>

          <div className="nav-actions">
            <button className="outline-btn">Contact Sales</button>
            <button className="blue-btn">Sign Up Free</button>
          </div>
        </div>

        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <main className="meet-main">
        <div className="left-section">
          <h1>Start or Join a Meeting</h1>
          <p>Connect with your team instantly or schedule ahead.</p>
          <div className="actions">
                    <input value={email} 
          onChange={e => setEmail(e.target.value)} 
          type="email" 
          placeholder="Enter your Email" 
        />
                  <input 
          value={roomId} 
          onChange={e => setroomId(e.target.value)} 
          type="text" 
          placeholder="Enter Room code" 
        />
            <button className="new-meeting"onClick={handlejoinroom}>Join Meet</button>
          </div>
          <a className="learn-more" href="/">Learn more</a>
        </div>
        <div className="right-section">
          <img src={Profile} alt="profile" className="logo-img" />
          <h2>Horizon Meet</h2>
        </div>
      </main>
    </div>
  );
};

export default Homepage;