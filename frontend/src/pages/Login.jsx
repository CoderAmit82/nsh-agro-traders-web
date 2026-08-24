import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

const Login = ({ setCurrentTab }) => {
  const { login, error } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      alert('Login successful! Welcome back to NSH Agro Traders.');
      setCurrentTab('home');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-green-50/10">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-primary-light rounded-full text-primary">
            <Leaf className="h-8 w-8 text-primary fill-primary-light" />
          </div>
          <h2 className="text-2xl font-black text-primary-dark">Farmer Account Login</h2>
          <p className="text-xs text-gray-500">Access your purchases, invoices, and message history</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-semibold text-center border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-3 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-10 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-3.5 p-1 text-gray-500"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 && password.length < 8 && (
              <p className="text-xs text-red-600 mt-1">Password must be at least 8 characters.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <LogIn className="h-4.5 w-4.5" />
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            New to NSH Agro Traders?{' '}
            <button
              onClick={() => setCurrentTab('signup')}
              className="text-primary font-bold hover:underline bg-transparent border-none p-0 outline-none"
            >
              Register Farmer Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
