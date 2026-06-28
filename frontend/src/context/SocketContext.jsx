import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

// Custom hook so we can easily grab the socket later
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to your Node.js backend server
    const newSocket = io('https://mockmate-podq.onrender.com', {
      withCredentials: true,
      transports: ['websocket'], // This skips polling and forces a direct connection!
    });

    setSocket(newSocket);

    // Clean up and disconnect when the user closes the app
    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};