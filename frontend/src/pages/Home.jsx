import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();
  
  // Check if the user has a token (VIP Pass) in their browser
  const token = localStorage.getItem('token');

  const handleCreateRoom = async () => {
    if (!token) {
      alert("You must be logged in to create a room!");
      navigate('/auth');
      return;
    }

    try {
      const response = await fetch('http://mockmate-podq.onrender.com/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // HERE IS THE MAGIC: We show the token to the bouncer!
          'Authorization': `Bearer ${token}` 
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        navigate(`/room/${data.roomId}`);
      } else {
        alert(data.message || "Failed to create room.");
        // If the token is expired or fake, kick them back to login
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/auth');
        }
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
      alert("Cannot connect to backend server.");
    }
  };

  const handleJoinRoom = () => {
    if (roomCode.length === 6) {
      navigate(`/room/${roomCode.toUpperCase()}`);
    } else {
      alert("Please enter a valid 6-digit room code.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Shred the VIP pass
    navigate('/auth'); // Send back to login
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white font-sans relative">
      
      {/* Logout Button (Only shows if logged in) */}
      {token && (
        <button 
          onClick={handleLogout}
          className="absolute top-6 right-6 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
        >
          Logout
        </button>
      )}

      {/* Logo Area */}
      <div className="mb-10 text-center">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400 mb-2">
          MockMate
        </h1>
        <p className="text-slate-400 text-lg">Your Real-Time DSA Interview Platform</p>
      </div>

      {/* Main Card */}
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-6 border border-slate-700">
        
        <button 
          onClick={handleCreateRoom}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] cursor-pointer"
        >
          Create New Interview Room
        </button>

        <div className="flex items-center gap-3 my-2">
          <hr className="w-full border-slate-600" />
          <span className="text-slate-400 text-sm font-semibold tracking-wider">OR</span>
          <hr className="w-full border-slate-600" />
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Enter 6-Digit Room Code"
            className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-4 rounded-xl outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-center text-xl uppercase tracking-[0.25em] placeholder:text-slate-500 placeholder:text-base placeholder:tracking-normal placeholder:lowercase"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            maxLength={6}
          />
          <button 
            onClick={handleJoinRoom}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg py-4 rounded-xl transition-all cursor-pointer"
          >
            Join Room
          </button>
        </div>

      </div>
    </div>
  );
}

export default Home;
