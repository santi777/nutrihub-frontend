import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

function NavItem({ to, icon, label, exact = false }) {
  const location = useLocation();
  const active = exact ? location.pathname === to : location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        active
          ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
          : 'text-muted hover:text-primary hover:bg-dark-600'
      }`}
    >
      <span className={`${active ? 'text-lime-400' : 'text-muted group-hover:text-primary'} transition-colors`}>
        {icon}
      </span>
      <span className="font-body text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function Layout({ children, navItems = [], title = '' }) {
  const { role, setRole, activeDietitian } = useApp();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    setRole('none');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-56' : 'w-16'
        } bg-dark-800 border-r border-dark-600 flex flex-col transition-all duration-300 fixed h-full z-20`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-dark-600">
          <div className="w-1.5 h-7 bg-lime-400 rounded-sm flex-shrink-0" />
          {sidebarOpen && (
            <span className="font-display text-xl tracking-widest text-primary">NUTRIHUB</span>
          )}
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-dark-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span className="font-body text-xs text-muted uppercase tracking-widest">
                {role === 'dietitian' ? 'Admin View' : 'Patient View'}
              </span>
            </div>
            {activeDietitian && sidebarOpen && (
              <p className="font-body text-xs text-primary/60 mt-1 truncate">{activeDietitian.name}</p>
            )}
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-dark-600 space-y-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted hover:text-primary hover:bg-dark-600 transition-all duration-200"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
            </svg>
            {sidebarOpen && <span className="font-body text-sm">Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="font-body text-sm">Switch Role</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-56' : 'ml-16'} transition-all duration-300 min-h-screen`}>
        {/* Top bar */}
        <div className="bg-dark-800 border-b border-dark-600 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-display text-2xl tracking-wider text-primary">{title}</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-lime-400/20 border border-lime-400/30 flex items-center justify-center">
              <span className="font-display text-lime-400 text-xs">
                {role === 'dietitian' ? 'DT' : 'PT'}
              </span>
            </div>
          </div>
        </div>
        <div className="p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
