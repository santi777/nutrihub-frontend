import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 'none' | 'dietitian' | 'patient'
  const [role, setRole] = useState('none');
  const [activeDietitian, setActiveDietitian] = useState(null);
  const [activePatient, setActivePatient] = useState(null);

  return (
    <AppContext.Provider value={{
      role, setRole,
      activeDietitian, setActiveDietitian,
      activePatient, setActivePatient,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
