import React, { createContext, useContext, useState } from 'react';

const USERS_KEY = 'nutrihub_users';
const CURRENT_USER_KEY = 'nutrihub_current_user';

const AuthContext = createContext(null);

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function loadCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadCurrentUser);

  const register = (name, email, password, role) => {
    const users = loadUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const user = { name, email, password, role, localPatientId: `local_${Date.now()}`, onboardingComplete: false };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const login = (email, password, role) => {
    const users = loadUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role
    );
    if (!user) {
      throw new Error('Invalid email, password, or role. Please try again.');
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const updateUser = (updates) => {
    const users = loadUsers();
    const updated = { ...currentUser, ...updates };
    const newUsers = users.map(u =>
      u.email.toLowerCase() === updated.email.toLowerCase() ? updated : u
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    setCurrentUser(updated);
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
