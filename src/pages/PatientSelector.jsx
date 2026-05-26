import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients } from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function PatientSelector() {
  const { setActivePatient } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
    if (currentUser?.role !== 'patient') {
      navigate('/dietitians', { replace: true });
      return;
    }
    getPatients()
      .then(res => {
        const match = res.data.find(
          pt => pt.email?.toLowerCase() === currentUser?.email?.toLowerCase()
        );
        if (match) {
          setActivePatient(match);
          navigate(`/patient/${match.id}`, { replace: true });
        } else {
          setNoProfile(true);
        }
      })
      .catch(() => setError('Could not load profile. Check backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg animate-fade-in text-center">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-1.5 h-8 bg-lime-400 rounded-sm" />
          <span className="font-display text-4xl tracking-widest text-primary">NUTRIHUB</span>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-muted font-body justify-center py-12">
            <div className="w-4 h-4 border-2 border-lime-400/40 border-t-lime-400 rounded-full animate-spin" />
            Loading your profile...
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 font-body text-red-400 text-sm">
            {error}
          </div>
        )}

        {noProfile && (
          <div className="py-12">
            <div className="font-display text-4xl text-dark-600 mb-4">NO PROFILE FOUND</div>
            <p className="font-body text-muted text-sm mb-2">
              No patient record matches <span className="text-primary">{currentUser?.email}</span>.
            </p>
            <p className="font-body text-muted text-sm">
              Ask your dietitian to add your email to your patient profile.
            </p>
          </div>
        )}

        <button
          onClick={() => navigate('/login')}
          className="mt-8 font-body text-sm text-muted hover:text-primary transition-colors py-2"
        >
          ← Back to login
        </button>
      </div>
    </div>
  );
}
