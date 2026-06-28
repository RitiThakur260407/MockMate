import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Editor from '@monaco-editor/react';

function Room() {
  const { roomId } = useParams();
  const socket = useSocket();
  
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [code, setCode] = useState('// Write your DSA solution here...\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello MockMate!" << endl;\n    return 0;\n}');
  
  // NEW: State for the uploaded resume URL
  const [resumeUrl, setResumeUrl] = useState(null);

  const myVideoRef = useRef();
  const partnerVideoRef = useRef();
  const peerRef = useRef(null);     
  const streamRef = useRef(null);   

  useEffect(() => {
    if (!socket) return;

    fetch(`http://mockmate-podq.onrender.com/api/chat/${roomId}`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(m => ({ text: `History: ${m.text}`, isSystem: false }));
        setChatHistory([{ text: 'System: Joined the real-time session.', isSystem: true }, ...formatted]);
      })
      .catch(err => console.error("Could not fetch chat history:", err));

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;
        
        socket.emit('join-room', roomId);
      })
      .catch((err) => console.error("Failed to get local stream:", err));


    socket.on('user-connected', async (newUserId) => {
      const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      peerRef.current = peer;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => peer.addTrack(track, streamRef.current));
      }

      peer.onicecandidate = (e) => {
        if (e.candidate) socket.emit('ice-candidate', { target: newUserId, candidate: e.candidate });
      };

      peer.ontrack = (e) => {
        if (partnerVideoRef.current) partnerVideoRef.current.srcObject = e.streams[0];
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('offer', { target: newUserId, caller: socket.id, sdp: offer });
    });

    socket.on('offer', async (payload) => {
      const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      peerRef.current = peer;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => peer.addTrack(track, streamRef.current));
      }

      peer.onicecandidate = (e) => {
        if (e.candidate) socket.emit('ice-candidate', { target: payload.caller, candidate: e.candidate });
      };

      peer.ontrack = (e) => {
        if (partnerVideoRef.current) partnerVideoRef.current.srcObject = e.streams[0];
      };

      await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('answer', { target: payload.caller, sdp: answer });
    });

    socket.on('answer', async (payload) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      }
    });

    socket.on('ice-candidate', async (payload) => {
      if (peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (e) { console.log(e); }
      }
    });

    socket.on('receive-message', (newMessage) => {
      setChatHistory((prev) => [...prev, { text: `Partner: ${newMessage}`, isSystem: false }]);
    });
    
    socket.on('receive-code', (newCode) => {
      setCode(newCode);
    });

    // NEW: Listen for the partner uploading a resume
    socket.on('receive-resume', (url) => {
      setResumeUrl(url);
    });

    return () => {
      socket.off('user-connected');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('receive-message');
      socket.off('receive-code');
      socket.off('receive-resume'); // Clean up listener
    };
  }, [socket, roomId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;
    socket.emit('send-message', { roomId, message });
    setChatHistory((prev) => [...prev, { text: `You: ${message}`, isSystem: false }]);
    setMessage(''); 
  };

  const handleCodeChange = (newValue) => {
    setCode(newValue); 
    socket.emit('send-code', { roomId, code: newValue }); 
  };

  // NEW: Handle PDF File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      const res = await fetch('http://mockmate-podq.onrender.com/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setResumeUrl(data.filePath); // Show it on our screen
      socket.emit('send-resume', { roomId, resumeUrl: data.filePath }); // Show it on partner's screen
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload resume.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      
      <header className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shadow-md z-10">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">
          MockMate
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">Room Code:</span>
          <div className="bg-slate-900 border border-slate-600 px-4 py-2 rounded-lg font-mono text-xl tracking-[0.25em] text-emerald-300 shadow-inner">
            {roomId}
          </div>
        </div>
      </header>

      <div className="flex-1 flex p-4 gap-4">
        
        <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col shadow-lg overflow-hidden">
          
          {/* UPDATED: Dynamic Header for Editor vs Resume */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-slate-300 font-semibold tracking-wide">
              {resumeUrl ? "Resume Viewer" : "Live Code Editor"}
            </h2>
            
            <div className="flex items-center gap-3">
              {/* If a resume is showing, give a button to switch back to code */}
              {resumeUrl && (
                <button 
                  onClick={() => setResumeUrl(null)} 
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-1.5 rounded transition-colors cursor-pointer"
                >
                  View Code
                </button>
              )}
              
              {/* Sleek File Upload Button */}
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileUpload} 
                className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer transition-colors" 
              />
              
              {!resumeUrl && <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-md">C++</span>}
            </div>
          </div>
          
          {/* UPDATED: Conditionally render the PDF iframe OR the Monaco Editor */}
          <div className="flex-1 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
            {resumeUrl ? (
              <iframe src={resumeUrl} className="w-full h-full" title="Resume" />
            ) : (
              <Editor
                height="100%"
                defaultLanguage="cpp"
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', padding: { top: 16 } }}
              />
            )}
          </div>

        </div>

        <div className="w-96 flex flex-col gap-4">
          
          <div className="flex gap-2 h-40">
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden relative shadow-lg">
              <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
              <span className="absolute bottom-2 left-2 bg-slate-900/70 px-2 py-1 text-xs rounded text-slate-300">You</span>
            </div>
            
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden relative shadow-lg flex items-center justify-center">
              <video ref={partnerVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
          </div>
          
          <form onSubmit={handleSendMessage} className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col p-4 shadow-lg">
            <h2 className="text-slate-300 mb-3 font-semibold tracking-wide">Live Chat</h2>
            <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 mb-3 p-3 text-sm flex flex-col gap-2 overflow-y-auto shadow-inner">
              {chatHistory.map((msg, index) => (
                <p key={index} className={msg.isSystem ? "text-cyan-400 text-xs font-mono bg-cyan-400/10 px-2 py-1 rounded w-fit" : "text-slate-200"}>
                  {msg.text}
                </p>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Type a message..." className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-500" value={message} onChange={(e) => setMessage(e.target.value)} />
              <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md cursor-pointer">Send</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Room;
