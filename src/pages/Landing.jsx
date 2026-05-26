import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Landing() {
  const { setRole } = useApp();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setRole(role);
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#2d5a3d 1px, transparent 1px), linear-gradient(90deg, #2d5a3d 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Glowing orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-lime-400 opacity-5 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center animate-fade-in">
        {/* Logo mark */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-3 h-10 bg-lime-400 rounded-sm" />
          <span className="font-display text-6xl tracking-widest text-primary">NUTRIHUB</span>
          <div className="w-3 h-10 bg-lime-400 rounded-sm" />
        </div>

        <p className="font-body text-muted text-lg mb-16 tracking-wide">
          Precision nutrition. Measurable results.
        </p>

        <p className="font-body text-primary/40 text-sm uppercase tracking-[0.3em] mb-8">
          Select your role to continue
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          {/* Dietitian card */}
          <button
            onClick={() => handleRoleSelect('dietitian')}
            className="group relative w-64 h-48 bg-dark-800 border border-dark-500 rounded-lg overflow-hidden hover:border-lime-400 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-lime-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-1 h-0 bg-lime-400 group-hover:h-full transition-all duration-300" />
            <div className="relative p-8 flex flex-col items-start h-full justify-between">
              <div className="w-12 h-12 rounded-lg bg-dark-600 border border-dark-400 flex items-center justify-center group-hover:border-lime-400 transition-colors duration-300">
                <svg className="w-6 h-6 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-display text-2xl tracking-wider text-primary mb-1">DIETITIAN</div>
                <div className="font-body text-xs text-muted">Manage patients & plans</div>
              </div>
            </div>
          </button>

          {/* Patient card */}
          <button
            onClick={() => handleRoleSelect('patient')}
            className="group relative w-64 h-48 bg-dark-800 border border-dark-500 rounded-lg overflow-hidden hover:border-lime-400 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-lime-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-1 h-0 bg-lime-400 group-hover:h-full transition-all duration-300" />
            <div className="relative p-8 flex flex-col items-start h-full justify-between">
              <div className="w-12 h-12 rounded-lg bg-dark-600 border border-dark-400 flex items-center justify-center group-hover:border-lime-400 transition-colors duration-300">
                <svg className="w-6 h-6 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-display text-2xl tracking-wider text-primary mb-1">PATIENT</div>
                <div className="font-body text-xs text-muted">View your nutrition plan</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
