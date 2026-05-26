import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import DietitianList from './pages/DietitianList';
import DietitianDashboard from './pages/DietitianDashboard';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import PatientSelector from './pages/PatientSelector';
import PatientDashboard from './pages/PatientDashboard';
import PatientOnboarding from './pages/PatientOnboarding';
import DietitianBrowse from './pages/DietitianBrowse';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/patient/onboarding" element={<PatientOnboarding />} />
            <Route path="/dietitians/browse" element={<DietitianBrowse />} />
            <Route path="/dietitians" element={<DietitianList />} />
            <Route path="/dietitian/:id" element={<DietitianDashboard />} />
            <Route path="/dietitian/:id/patients" element={<PatientList />} />
            <Route path="/dietitian/:id/patient/:patientId" element={<PatientDetail />} />
            <Route path="/patients" element={<PatientSelector />} />
            <Route path="/patient/:patientId" element={<PatientDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
