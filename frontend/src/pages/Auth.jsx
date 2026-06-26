import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState(''); // <-- Added Name State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    // If logging in, just send email/password. If registering, include the name!
    const payload = isLogin ? { email, password } : { name, email, password };
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // Save the VIP Pass (Token) to the browser's local storage
        localStorage.setItem('token', data.token);
        alert(`${isLogin ? 'Login' : 'Registration'} successful!`);
        // Send them to the Home dashboard
        navigate('/');
      } else {
        alert(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Cannot connect to server.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white font-sans">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400 mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* MAGIC HIDING FIELD: Only shows up during Registration! */}
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-lg py-3 rounded-xl transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)] mt-2 cursor-pointer"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="text-slate-400 text-sm text-center mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline cursor-pointer"
          >
            {isLogin ? 'Sign up here' : 'Log in here'}
          </button>
        </p>

      </div>
    </div>
  );
}

export default Auth;