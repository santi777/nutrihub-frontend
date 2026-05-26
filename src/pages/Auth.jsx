import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  const { setRole } = useApp();
  const navigate = useNavigate();

  const initialRole = searchParams.get('role') === 'patient' ? 'patient' : 'dietitian';
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSwitch = (role) => {
    setSelectedRole(role);
    setRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (mode === 'signup') {
        user = register(name.trim(), email.trim(), password, selectedRole);
      } else {
        user = login(email.trim(), password, selectedRole);
      }
      setRole(selectedRole);
      if (selectedRole === 'dietitian') {
        navigate('/dietitians');
      } else if (user.onboardingComplete) {
        navigate(`/patient/${user.localPatientId}`);
      } else {
        navigate('/patient/onboarding');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(m => (m === 'login' ? 'signup' : 'login'));
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#2d5a3d 1px, transparent 1px), linear-gradient(90deg, #2d5a3d 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-lime-400 opacity-5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4 animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-2 h-8 bg-lime-400 rounded-sm" />
          <span className="font-display text-4xl tracking-widest text-primary">NUTRIHUB</span>
          <div className="w-2 h-8 bg-lime-400 rounded-sm" />
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
          {/* Role tabs */}
          <div className="flex border-b border-dark-600">
            {['dietitian', 'patient'].map(role => (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className={`flex-1 py-3.5 font-display tracking-widest text-sm uppercase transition-all duration-200 ${
                  selectedRole === role
                    ? 'text-lime-400 border-b-2 border-lime-400 bg-lime-400/5'
                    : 'text-muted hover:text-primary'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <h2 className="font-display text-2xl tracking-wider text-primary mb-6">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>

            <div className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 font-body text-sm text-primary placeholder-muted/50 focus:outline-none focus:border-lime-400 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 font-body text-sm text-primary placeholder-muted/50 focus:outline-none focus:border-lime-400 transition-colors"
                />
              </div>

              <div>
                <label className="block font-body text-xs text-muted uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 font-body text-sm text-primary placeholder-muted/50 focus:outline-none focus:border-lime-400 transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 font-body text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-lime-400 text-dark-800 font-display tracking-widest text-sm uppercase py-3 rounded-lg hover:bg-lime-400/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
            </button>

            <p className="mt-5 text-center font-body text-sm text-muted">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-lime-400 hover:underline"
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </form>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full text-center font-body text-xs text-muted/60 hover:text-muted transition-colors"
        >
          ← Back to role selection
        </button>
      </div>
    </div>
  );
}
