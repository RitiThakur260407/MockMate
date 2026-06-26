import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import Auth from './pages/Auth';
import { SocketProvider } from './context/SocketContext'; // Imported the provider!

function App() {
  return (
    <SocketProvider> {/* Wrapped everything inside the socket engine */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;